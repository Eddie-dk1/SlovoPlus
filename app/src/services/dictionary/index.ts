import { localDictionary } from '../../data/localDictionary'
import type { WordData, WordDataProvider } from '../../types/word'
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

const WORD_DATA_CACHE_LIMIT = 80
const wordDataCache = new Map<string, WordData>()

interface DictionaryProviderStep {
  id: string
  sourceProvider: WordDataProvider
  fetch: () => Promise<WordData | null>
}

export function clearWordDataCacheForTests(): void {
  wordDataCache.clear()
}

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

function getCacheKey(query: string, language: 'ru' | 'en'): string {
  return `${language}:${query}`
}

function cloneWordData(data: WordData): WordData {
  return {
    ...data,
    examples: [...data.examples],
    style: [...data.style],
    usageTips: [...data.usageTips],
    mistakes: [...data.mistakes],
    relatedWords: [...data.relatedWords],
  }
}

function getCachedWordData(query: string, language: 'ru' | 'en'): WordData | null {
  const cacheKey = getCacheKey(query, language)
  const cached = wordDataCache.get(cacheKey)

  if (!cached) {
    return null
  }

  wordDataCache.delete(cacheKey)
  wordDataCache.set(cacheKey, cached)
  return cloneWordData(cached)
}

function setCachedWordData(
  query: string,
  language: 'ru' | 'en',
  data: WordData,
): void {
  const cacheKey = getCacheKey(query, language)

  if (wordDataCache.has(cacheKey)) {
    wordDataCache.delete(cacheKey)
  }

  wordDataCache.set(cacheKey, cloneWordData(data))

  if (wordDataCache.size > WORD_DATA_CACHE_LIMIT) {
    const oldestKey = wordDataCache.keys().next().value
    if (oldestKey) {
      wordDataCache.delete(oldestKey)
    }
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

function createRussianProviderChain(
  query: string,
  signal?: AbortSignal,
): DictionaryProviderStep[] {
  return [
    {
      id: 'wiktionary-ru',
      sourceProvider: 'wiktionary',
      fetch: () => fetchFromWiktionaryApi(query, 'ru', signal),
    },
    {
      id: 'relyc',
      sourceProvider: 'relyc',
      fetch: () => fetchFromRelycDictionaryApi(query, signal),
    },
    {
      id: 'yandex-ru',
      sourceProvider: 'yandex',
      fetch: async () => {
        const yandexRu = await fetchFromYandexDictionaryApi(query, 'ru-ru', signal)
        if (!yandexRu) {
          return null
        }

        const extraExamples = await fetchBestEffortExamples(query, 'ru', signal)
        return ensureCompleteWordData(query, {
          ...yandexRu,
          examples: pickBestExamples(
            query,
            true,
            yandexRu.partOfSpeech,
            yandexRu.examples,
            extraExamples,
          ),
        })
      },
    },
    {
      id: 'free-dictionary-ru',
      sourceProvider: 'free_dictionary',
      fetch: () => fetchFromFreeDictionaryApi(query, 'ru', signal),
    },
    {
      id: 'free-dictionary-all',
      sourceProvider: 'free_dictionary',
      fetch: () => fetchFromFreeDictionaryApi(query, 'all', signal),
    },
    {
      id: 'legacy-ru',
      sourceProvider: 'legacy_dictionary',
      fetch: () => fetchFromLegacyApi(query, 'ru', signal),
    },
    {
      id: 'semantic-fallback',
      sourceProvider: 'semantic',
      fetch: async () => fromSemanticFallback(query),
    },
  ]
}

function createEnglishProviderChain(
  query: string,
  signal?: AbortSignal,
): DictionaryProviderStep[] {
  return [
    {
      id: 'wiktionary-en',
      sourceProvider: 'wiktionary',
      fetch: async () => {
        const wiktionaryEn = await fetchFromWiktionaryApi(query, 'en', signal)
        return wiktionaryEn
          ? enrichEnglishRelatedWords(wiktionaryEn, query, signal)
          : null
      },
    },
    {
      id: 'relyc',
      sourceProvider: 'relyc',
      fetch: () => fetchFromRelycDictionaryApi(query, signal),
    },
    {
      id: 'yandex-en',
      sourceProvider: 'yandex',
      fetch: async () => {
        const yandexEn = await fetchFromYandexDictionaryApi(query, 'en-en', signal)
        if (!yandexEn) {
          return null
        }

        const extraExamples = await fetchBestEffortExamples(query, 'en', signal)
        return ensureCompleteWordData(query, {
          ...yandexEn,
          examples: pickBestExamples(
            query,
            false,
            yandexEn.partOfSpeech,
            yandexEn.examples,
            extraExamples,
          ),
        })
      },
    },
    {
      id: 'free-dictionary-en',
      sourceProvider: 'free_dictionary',
      fetch: () => fetchFromFreeDictionaryApi(query, 'en', signal),
    },
    {
      id: 'free-dictionary-all',
      sourceProvider: 'free_dictionary',
      fetch: () => fetchFromFreeDictionaryApi(query, 'all', signal),
    },
    {
      id: 'legacy-en',
      sourceProvider: 'legacy_dictionary',
      fetch: () => fetchFromLegacyApi(query, 'en', signal),
    },
  ]
}

async function resolveFromProviderChain(
  query: string,
  language: 'ru' | 'en',
  signal?: AbortSignal,
): Promise<WordData> {
  let hasServiceErrors = false
  let bestCandidate: WordData | null = null
  const targetTier: WordDataQualityTier = 'dictionary'
  const providerChain =
    language === 'ru'
      ? createRussianProviderChain(query, signal)
      : createEnglishProviderChain(query, signal)

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
    provider: DictionaryProviderStep,
  ): Promise<WordData | null> => {
    try {
      return await provider.fetch()
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error
      }

      hasServiceErrors = true
      return null
    }
  }

  for (const provider of providerChain) {
    const rawCandidate = await tryProvider(provider)
    const candidate = rawCandidate
      ? {
          ...rawCandidate,
          sourceProvider: provider.sourceProvider,
        }
      : null

    if (candidate && considerCandidate(candidate)) {
      return candidate
    }
  }

  if (bestCandidate) {
    return bestCandidate
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
        sourceProvider: 'local',
      },
      displayWord,
    )
  }

  const cachedData = getCachedWordData(query, language)
  if (cachedData) {
    return withDisplayWord(cachedData, displayWord)
  }

  try {
    const data = await resolveFromProviderChain(query, language, signal)
    setCachedWordData(query, language, data)
    return withDisplayWord(data, displayWord)
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
