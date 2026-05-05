import { localDictionary } from '../../data/localDictionary'
import type { WordData } from '../../types/word'
import { detectWordLanguage, isSupportedLookupText } from '../../utils/language'
import { normalizeWord } from '../../utils/normalizeWord'
import { DictionaryError } from './errors'
import { mergeWithHints } from './hints'
import { ensureCompleteWordData, pickBestExamples } from './normalizers'
import { fetchDatamuseRelatedWords } from './providers/datamuse'
import { fetchFromFreeDictionaryApi, fetchRawExamplesFromFreeDictionary } from './providers/freeDictionary'
import { fetchFromLegacyApi } from './providers/legacyDictionary'
import { fetchFromRelycDictionaryApi } from './providers/relycDictionary'
import { fromSemanticFallback } from './providers/semantic'
import { fetchFromWiktionaryApi } from './providers/wiktionary'
import { fetchFromYandexDictionaryApi } from './providers/yandex'
import {
  detectWordDataQualityTier,
  isBetterWordDataCandidate,
  isTierAtLeast,
  type WordDataQualityTier,
} from './quality'

function sanitizeDisplayWord(rawQuery: string, normalizedQuery: string): string {
  const cleaned = rawQuery
    .trim()
    .replace(/[.,!?;:()"'`]/g, '')

  return cleaned || normalizedQuery
}

function withDisplayWord(data: WordData, displayWord: string): WordData {
  if (!displayWord) {
    return data
  }

  return {
    ...data,
    word: displayWord,
  }
}

function getLanguageAwareErrorMessage(
  language: 'ru' | 'en' | null,
  code: 'EMPTY' | 'INVALID' | 'NOT_FOUND' | 'NETWORK',
  query?: string,
): string {
  if (language === 'en') {
    const word = query ? `"${query}"` : 'this word'
    const messages: Record<typeof code, string> = {
      EMPTY: 'Enter a word to search.',
      INVALID: 'Use one English word or phrase without digits or mixed alphabets.',
      NOT_FOUND: `No reliable dictionary entry was found for ${word}. Check spelling or try another word.`,
      NETWORK: 'Dictionary services are temporarily unavailable. Try again later.',
    }

    return messages[code]
  }

  const word = query ? `«${query}»` : 'слово'
  const messages: Record<typeof code, string> = {
    EMPTY: 'Введите слово для поиска.',
    INVALID: 'Введите русское или английское слово без цифр и смешения алфавитов.',
    NOT_FOUND: `Не удалось найти надёжное словарное значение для ${word}. Проверьте написание или попробуйте другое слово.`,
    NETWORK: 'Словарные сервисы временно недоступны. Попробуйте позже.',
  }

  return messages[code]
}

async function fetchBestEffortExamples(
  query: string,
  preferredLanguage: 'ru' | 'en',
  signal?: AbortSignal,
): Promise<string[]> {
  const tryFetchExamples = async (language: 'ru' | 'en' | 'all'): Promise<string[]> => {
    try {
      return await fetchRawExamplesFromFreeDictionary(query, language, signal)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error
      }

      return []
    }
  }

  const preferredExamples = await tryFetchExamples(preferredLanguage)
  if (preferredExamples.length > 0) {
    return preferredExamples
  }

  return tryFetchExamples('all')
}

async function enrichEnglishRelatedWords(
  data: WordData,
  query: string,
  signal?: AbortSignal,
): Promise<WordData> {
  try {
    const datamuseRelated = await fetchDatamuseRelatedWords(query, signal)
    if (datamuseRelated.length === 0) {
      return data
    }

    return {
      ...data,
      relatedWords: datamuseRelated,
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    return data
  }
}

export async function fetchWordData(
  rawQuery: string,
  signal?: AbortSignal,
): Promise<WordData> {
  const query = normalizeWord(rawQuery)
  const displayWord = sanitizeDisplayWord(rawQuery, query)

  if (!query) {
    throw new DictionaryError('Введите слово для поиска.', 'NOT_FOUND')
  }

  const language = detectWordLanguage(query)
  if (!language || !isSupportedLookupText(query, language)) {
    throw new DictionaryError(
      getLanguageAwareErrorMessage(language, 'INVALID'),
      'NOT_FOUND',
    )
  }

  const localData = localDictionary[query]
  if (localData) {
    return withDisplayWord(
      {
        ...mergeWithHints(localData, query),
        language,
      },
      displayWord,
    )
  }

  const isRussianInput = language === 'ru'
  let hasServiceErrors = false
  let bestCandidate: WordData | null = null
  const targetTier: WordDataQualityTier = 'dictionary'

  const considerCandidate = (candidate: WordData | null): boolean => {
    if (!candidate) {
      return false
    }

    if (isBetterWordDataCandidate(query, candidate, bestCandidate)) {
      bestCandidate = candidate
    }

    const qualityTier = detectWordDataQualityTier(query, candidate)
    return isTierAtLeast(qualityTier, targetTier)
  }

  const tryProvider = async (
    provider: () => Promise<WordData | null>,
  ): Promise<WordData | null> => {
    try {
      return await provider()
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error
      }

      hasServiceErrors = true
      return null
    }
  }

  try {
    if (isRussianInput) {
      const wiktionaryRu = await tryProvider(() =>
        fetchFromWiktionaryApi(query, 'ru', signal),
      )
      if (wiktionaryRu && considerCandidate(wiktionaryRu)) {
        return withDisplayWord(wiktionaryRu, displayWord)
      }

      const relycRu = await tryProvider(() => fetchFromRelycDictionaryApi(query, signal))
      if (relycRu && considerCandidate(relycRu)) {
        return withDisplayWord(relycRu, displayWord)
      }

      const yandexRu = await tryProvider(() =>
        fetchFromYandexDictionaryApi(query, 'ru-ru', signal),
      )
      if (yandexRu) {
        const extraExamples = await fetchBestEffortExamples(query, 'ru', signal)

        const enrichedYandex = ensureCompleteWordData(query, {
          ...yandexRu,
          examples: pickBestExamples(
            query,
            true,
            yandexRu.partOfSpeech,
            yandexRu.examples,
            extraExamples,
          ),
        })

        if (considerCandidate(enrichedYandex)) {
          return withDisplayWord(enrichedYandex, displayWord)
        }
      }

      const freeRu = await tryProvider(() =>
        fetchFromFreeDictionaryApi(query, 'ru', signal),
      )
      if (freeRu && considerCandidate(freeRu)) {
        return withDisplayWord(freeRu, displayWord)
      }

      const freeAll = await tryProvider(() =>
        fetchFromFreeDictionaryApi(query, 'all', signal),
      )
      if (freeAll && considerCandidate(freeAll)) {
        return withDisplayWord(freeAll, displayWord)
      }

      const legacyRu = await tryProvider(() => fetchFromLegacyApi(query, 'ru', signal))
      if (legacyRu && considerCandidate(legacyRu)) {
        return withDisplayWord(legacyRu, displayWord)
      }

      const semanticFallback = fromSemanticFallback(query)
      if (semanticFallback && considerCandidate(semanticFallback)) {
        return withDisplayWord(semanticFallback, displayWord)
      }

      if (bestCandidate) {
        return withDisplayWord(bestCandidate, displayWord)
      }

      if (hasServiceErrors) {
        throw new DictionaryError(
          getLanguageAwareErrorMessage(language, 'NETWORK'),
          'NETWORK',
        )
      }

      throw new DictionaryError(
        getLanguageAwareErrorMessage(language, 'NOT_FOUND', query),
        'NOT_FOUND',
      )
    }

    const wiktionaryEn = await tryProvider(() =>
      fetchFromWiktionaryApi(query, 'en', signal),
    )
    if (wiktionaryEn && considerCandidate(wiktionaryEn)) {
      return withDisplayWord(
        await enrichEnglishRelatedWords(wiktionaryEn, query, signal),
        displayWord,
      )
    }

    const relycAny = await tryProvider(() => fetchFromRelycDictionaryApi(query, signal))
    if (relycAny && considerCandidate(relycAny)) {
      return withDisplayWord(relycAny, displayWord)
    }

    const yandexEn = await tryProvider(() =>
      fetchFromYandexDictionaryApi(query, 'en-en', signal),
    )
    if (yandexEn) {
      const extraExamples = await fetchBestEffortExamples(query, 'en', signal)

      const enrichedYandex = ensureCompleteWordData(query, {
        ...yandexEn,
        examples: pickBestExamples(
          query,
          false,
          yandexEn.partOfSpeech,
          yandexEn.examples,
          extraExamples,
        ),
      })

      if (considerCandidate(enrichedYandex)) {
        return withDisplayWord(enrichedYandex, displayWord)
      }
    }

    const freeEn = await tryProvider(() => fetchFromFreeDictionaryApi(query, 'en', signal))
    if (freeEn && considerCandidate(freeEn)) {
      return withDisplayWord(freeEn, displayWord)
    }

    const freeAll = await tryProvider(() =>
      fetchFromFreeDictionaryApi(query, 'all', signal),
    )
    if (freeAll && considerCandidate(freeAll)) {
      return withDisplayWord(freeAll, displayWord)
    }

    const legacyEn = await tryProvider(() => fetchFromLegacyApi(query, 'en', signal))
    if (legacyEn && considerCandidate(legacyEn)) {
      return withDisplayWord(legacyEn, displayWord)
    }

    if (bestCandidate) {
      return withDisplayWord(bestCandidate, displayWord)
    }

    if (hasServiceErrors) {
      throw new DictionaryError(
        getLanguageAwareErrorMessage(language, 'NETWORK'),
        'NETWORK',
      )
    }

    throw new DictionaryError(
      getLanguageAwareErrorMessage(language, 'NOT_FOUND', query),
      'NOT_FOUND',
    )
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    if (error instanceof DictionaryError) {
      throw error
    }

    throw new DictionaryError('Сервис словаря временно недоступен.', 'NETWORK')
  }
}

export { DictionaryError } from './errors'
export type { DictionaryErrorCode } from './errors'
