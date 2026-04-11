import type { FreeDictionaryResponse, WordData } from '../../../types/word'
import { FREE_DICTIONARY_API_BASE_URL } from '../constants'
import { DictionaryError } from '../errors'
import { mergeWithHints } from '../hints'
import { fetchWithResilience } from '../http'
import { ensureCompleteWordData, filterByExpectedScript, sanitizeRelatedWords } from '../normalizers'
import { uniqueValues } from '../utils/collections'
import {
  hasCyrillic,
  hasExpectedScript,
  isAcceptableDefinition,
  isCyrillicWord,
} from '../utils/script'
import { getFallbackExamples } from '../fallbacks'
import { parseExamplesPayload, parseFreeDictionaryPayload } from './validators'

export function fromFreeDictionaryResponse(
  query: string,
  payload: FreeDictionaryResponse,
  preferredLanguage: 'ru' | 'en' | 'all',
): WordData | null {
  const entries = payload.entries ?? []
  if (entries.length === 0) {
    return null
  }

  const byPreferredLanguage =
    preferredLanguage === 'all'
      ? entries
      : entries.filter((entry) => entry.language?.code === preferredLanguage)

  const selectedEntry =
    byPreferredLanguage[0] ??
    entries.find((entry) =>
      (entry.senses ?? []).some((sense) => hasCyrillic(sense.definition ?? '')),
    ) ??
    entries[0]
  const senses = selectedEntry.senses ?? []
  const russianInput = isCyrillicWord(query)
  const firstDefinition =
    senses.find((sense) => hasExpectedScript(sense.definition ?? '', russianInput))
      ?.definition ??
    (!russianInput
      ? senses.find((sense) => Boolean(sense.definition))?.definition
      : undefined)

  if (!firstDefinition) {
    return null
  }
  if (!isAcceptableDefinition(firstDefinition, russianInput)) {
    return null
  }

  const examples = uniqueValues(senses.flatMap((sense) => sense.examples ?? []), 8)
  const filteredExamples = filterByExpectedScript(examples, russianInput).slice(0, 3)
  const synonyms = uniqueValues(
    [...(selectedEntry.synonyms ?? []), ...senses.flatMap((sense) => sense.synonyms ?? [])],
    8,
  )
  const relatedWords = sanitizeRelatedWords(query, synonyms, russianInput)

  const baseData: WordData = {
    word: payload.word ?? query,
    definition: firstDefinition,
    simpleExplanation:
      'Определение получено из мультиязычного словаря на базе Wiktionary.',
    partOfSpeech: selectedEntry.partOfSpeech,
    examples:
      filteredExamples.length > 0
        ? filteredExamples
        : examples.length > 0
          ? examples.slice(0, 3)
          : getFallbackExamples(query, russianInput),
    style: [],
    usageTips: [],
    mistakes: [],
    relatedWords,
    source: 'api',
  }

  return ensureCompleteWordData(query, mergeWithHints(baseData, query))
}

export async function fetchFromFreeDictionaryApi(
  query: string,
  language: 'ru' | 'en' | 'all',
  signal?: AbortSignal,
): Promise<WordData | null> {
  const response = await fetchWithResilience(
    `${FREE_DICTIONARY_API_BASE_URL}/${language}/${encodeURIComponent(query)}`,
    {
      signal,
    },
  )

  if (response.status === 404) {
    return null
  }

  if (response.status === 429) {
    throw new DictionaryError('Превышен лимит запросов к словарному сервису.', 'NETWORK')
  }

  if (!response.ok) {
    throw new DictionaryError('Сервис словаря временно недоступен.', 'NETWORK')
  }

  const rawPayload = (await response.json()) as unknown
  const payload = parseFreeDictionaryPayload(rawPayload)
  if (!payload) {
    throw new DictionaryError('Некорректный ответ словарного сервиса.', 'UNKNOWN')
  }

  try {
    return fromFreeDictionaryResponse(query, payload, language)
  } catch (error) {
    if (error instanceof DictionaryError) {
      throw error
    }

    throw new DictionaryError('Некорректный ответ словарного сервиса.', 'UNKNOWN')
  }
}

export async function fetchRawExamplesFromFreeDictionary(
  query: string,
  language: 'ru' | 'en' | 'all',
  signal?: AbortSignal,
): Promise<string[]> {
  const response = await fetchWithResilience(
    `${FREE_DICTIONARY_API_BASE_URL}/${language}/${encodeURIComponent(query)}`,
    {
      signal,
    },
  )

  if (!response.ok) {
    return []
  }

  const rawPayload = (await response.json()) as unknown
  const examples = parseExamplesPayload(rawPayload)
  if (!examples) {
    return []
  }

  return uniqueValues(examples, 12)
}
