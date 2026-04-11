import { LEGACY_API_BASE_URL } from '../constants'
import { DictionaryError } from '../errors'
import { mergeWithHints } from '../hints'
import { fetchWithResilience } from '../http'
import { ensureCompleteWordData, filterByExpectedScript, sanitizeRelatedWords } from '../normalizers'
import { uniqueValues } from '../utils/collections'
import { isAcceptableDefinition, isCyrillicWord } from '../utils/script'
import type { DictionaryApiEntry, WordData } from '../../../types/word'
import { getFallbackExamples } from '../fallbacks'
import { parseLegacyPayload } from './validators'

export function fromLegacyApiEntry(query: string, payload: DictionaryApiEntry[]): WordData {
  const first = payload[0]
  const meanings = first?.meanings ?? []
  const firstMeaning = meanings[0]
  const allDefinitions = meanings.flatMap((meaning) => meaning.definitions ?? [])
  const firstDefinition = allDefinitions.find((item) => Boolean(item.definition))
  const examples = allDefinitions
    .map((item) => item.example)
    .filter((item): item is string => Boolean(item))
    .slice(0, 3)

  if (!firstDefinition?.definition) {
    throw new DictionaryError('Определение не найдено в ответе API.', 'NOT_FOUND')
  }

  const synonyms = uniqueValues(
    allDefinitions.flatMap((item) => item.synonyms ?? []),
    6,
  )
  const russianInput = isCyrillicWord(query)
  if (!isAcceptableDefinition(firstDefinition.definition, russianInput)) {
    throw new DictionaryError('Определение в ответе API не подходит по качеству.', 'NOT_FOUND')
  }
  const filteredExamples = filterByExpectedScript(examples, russianInput)
  const relatedWords = sanitizeRelatedWords(query, synonyms, russianInput)

  const baseData: WordData = {
    word: first.word ?? query,
    definition: firstDefinition.definition,
    simpleExplanation:
      'Определение получено из словарного API и может быть дополнено вручную.',
    partOfSpeech: firstMeaning?.partOfSpeech,
    examples:
      filteredExamples.length > 0
        ? filteredExamples
        : examples.length > 0
          ? examples
          : getFallbackExamples(query, russianInput),
    style: [],
    usageTips: [],
    mistakes: [],
    relatedWords,
    source: 'api',
  }

  return ensureCompleteWordData(query, mergeWithHints(baseData, query))
}

export async function fetchFromLegacyApi(
  query: string,
  language: 'ru' | 'en',
  signal?: AbortSignal,
): Promise<WordData | null> {
  const response = await fetchWithResilience(
    `${LEGACY_API_BASE_URL}/${language}/${encodeURIComponent(query)}`,
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
  const payload = parseLegacyPayload(rawPayload)
  if (!payload || payload.length === 0) {
    if (payload === null) {
      throw new DictionaryError('Некорректный ответ словарного сервиса.', 'UNKNOWN')
    }

    return null
  }

  try {
    return fromLegacyApiEntry(query, payload)
  } catch (error) {
    if (error instanceof DictionaryError && error.code === 'NOT_FOUND') {
      return null
    }

    throw error
  }
}
