import { YANDEX_DICTIONARY_API_BASE_URL, YANDEX_DICTIONARY_API_KEY } from '../constants'
import { DictionaryError } from '../errors'
import { mergeWithHints } from '../hints'
import { fetchWithResilience } from '../http'
import { ensureCompleteWordData, pickBestExamples, sanitizeRelatedWords } from '../normalizers'
import { isCyrillicWord } from '../utils/script'
import type { WordData } from '../../../types/word'
import { uniqueValues } from '../utils/collections'
import { parseYandexPayload, type YandexDictionaryResponse } from './validators'

export function fromYandexDictionaryResponse(
  query: string,
  payload: YandexDictionaryResponse,
): WordData | null {
  const isRussianInput = isCyrillicWord(query)
  const firstDefinition = payload.def?.[0]
  const translations = firstDefinition?.tr ?? []
  const primary = translations.find((item) => Boolean(item.text))?.text

  if (!primary) {
    return null
  }

  const candidates = uniqueValues(
    [
      ...translations.map((item) => item.text ?? ''),
      ...translations.flatMap((item) => (item.syn ?? []).map((syn) => syn.text ?? '')),
      ...translations.flatMap((item) => (item.mean ?? []).map((mean) => mean.text ?? '')),
    ],
    20,
  )

  const relatedWords = sanitizeRelatedWords(query, candidates, isRussianInput)
  const examples = uniqueValues(
    translations.flatMap((item) => [
      ...(item.ex ?? []).map((example) => example.text ?? ''),
      ...(item.ex ?? []).flatMap((example) => (example.tr ?? []).map((tr) => tr.text ?? '')),
    ]),
    8,
  )

  const definition = isRussianInput
    ? `«${query}» — ${primary}.`
    : `"${query}" means "${primary}".`

  const baseData: WordData = {
    word: firstDefinition?.text ?? query,
    definition,
    simpleExplanation: isRussianInput
      ? 'Определение и близкие значения получены из Яндекс.Словаря.'
      : 'Definition and related meanings are provided by Yandex Dictionary.',
    partOfSpeech: firstDefinition?.pos,
    examples: pickBestExamples(query, isRussianInput, firstDefinition?.pos, examples),
    style: [],
    usageTips: [],
    mistakes: [],
    relatedWords,
    source: 'api',
  }

  return ensureCompleteWordData(query, mergeWithHints(baseData, query))
}

export async function fetchFromYandexDictionaryApi(
  query: string,
  language: 'ru-ru' | 'en-en',
  signal?: AbortSignal,
): Promise<WordData | null> {
  if (!YANDEX_DICTIONARY_API_KEY) {
    return null
  }

  const response = await fetchWithResilience(
    `${YANDEX_DICTIONARY_API_BASE_URL}?key=${encodeURIComponent(YANDEX_DICTIONARY_API_KEY)}&lang=${language}&text=${encodeURIComponent(query)}`,
    {
      signal,
    },
  )

  if (response.status === 401 || response.status === 403 || response.status === 404) {
    return null
  }

  if (response.status === 429) {
    throw new DictionaryError('Превышен лимит запросов к словарному сервису.', 'NETWORK')
  }

  if (!response.ok) {
    throw new DictionaryError('Сервис Яндекс.Словаря временно недоступен.', 'NETWORK')
  }

  const rawPayload = (await response.json()) as unknown
  const payload = parseYandexPayload(rawPayload)
  if (!payload) {
    throw new DictionaryError('Некорректный ответ словарного сервиса.', 'UNKNOWN')
  }

  return fromYandexDictionaryResponse(query, payload)
}
