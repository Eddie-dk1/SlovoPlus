import type { WordData } from '../../../types/word'
import { frequentWordOverrides } from '../../../data/frequentWordOverrides'
import { buildSemanticAssistFromEnglish } from '../semanticAssist'
import { RELYC_DICTIONARY_API_BASE_URL } from '../constants'
import { DictionaryError } from '../errors'
import { mergeWithHints } from '../hints'
import { fetchWithResilience } from '../http'
import { ensureCompleteWordData } from '../normalizers'
import { uniqueValues } from '../utils/collections'
import { isCyrillicWord } from '../utils/script'
import { parseRelycPayload, type RelycDictionaryResponse } from './validators'

function normalizeRelycPartOfSpeech(pos?: string): string | undefined {
  if (!pos) {
    return undefined
  }

  const normalized = pos.trim().toLowerCase()
  const map: Record<string, string> = {
    noun: 'noun',
    verb: 'verb',
    adjective: 'adjective',
    adverb: 'adverb',
    pronoun: 'pronoun',
    preposition: 'preposition',
    conjunction: 'conjunction',
    interjection: 'interjection',
    particle: 'particle',
    numeral: 'numeral',
  }

  return map[normalized] ?? map[normalized.toLowerCase()] ?? normalized
}

function pickDefinitionCandidates(
  payload: RelycDictionaryResponse,
  isRussianInput: boolean,
): {
  entry:
    | NonNullable<RelycDictionaryResponse['entries']>[number]
    | undefined
  definitions: string[]
  englishDefinitions: string[]
  hasRussianDefinition: boolean
} {
  const entries = payload.entries ?? []

  if (entries.length === 0) {
    return {
      entry: undefined,
      definitions: [],
      englishDefinitions: [],
      hasRussianDefinition: false,
    }
  }

  const preferredEntry = isRussianInput
    ? entries.find((item) => item.lang === 'ru')
    : entries.find((item) => item.lang === 'en')

  const orderedEntries =
    preferredEntry
      ? [preferredEntry, ...entries.filter((item) => item !== preferredEntry)]
      : [...entries]
  const allDefinitionGroups = orderedEntries.flatMap((item) => item.definitions ?? [])
  const preferredDefinitionGroups = orderedEntries[0]?.definitions ?? []

  const getDefinitionsByLocale = (
    groups: Array<{ locale?: string; definitions?: string[] }>,
    locale: string,
  ): string[] => {
    return groups
      .filter((item) => item.locale?.toLowerCase() === locale)
      .flatMap((item) => item.definitions ?? [])
  }

  const preferredLocale = isRussianInput ? 'ru' : 'en'
  const preferredDefs = getDefinitionsByLocale(preferredDefinitionGroups, preferredLocale)
  const globalPreferredDefs = getDefinitionsByLocale(allDefinitionGroups, preferredLocale)
  const englishDefs = getDefinitionsByLocale(allDefinitionGroups, 'en')
  const fallbackDefs = allDefinitionGroups.flatMap((item) => item.definitions ?? [])

  const definitions = uniqueValues(
    preferredDefs.length > 0
      ? preferredDefs
      : globalPreferredDefs.length > 0
        ? globalPreferredDefs
      : englishDefs.length > 0
        ? englishDefs
        : fallbackDefs,
    3,
  )
  const entryForMetadata =
    orderedEntries.find((item) => Boolean(item.lemma?.trim()) || Boolean(item.pos)) ??
    orderedEntries[0]

  return {
    entry: entryForMetadata,
    definitions,
    englishDefinitions: uniqueValues(englishDefs, 5),
    hasRussianDefinition:
      preferredLocale === 'ru' && globalPreferredDefs.length > 0,
  }
}

export function fromRelycDictionaryResponse(
  query: string,
  payload: RelycDictionaryResponse,
): WordData | null {
  const isRussianInput = isCyrillicWord(query)
  const {
    entry,
    definitions,
    englishDefinitions,
    hasRussianDefinition,
  } = pickDefinitionCandidates(payload, isRussianInput)

  if (!entry || definitions.length === 0) {
    return null
  }

  const normalizedWord = entry.lemma?.trim() || payload.word?.trim() || query
  const override = frequentWordOverrides[query]
  const partOfSpeech = override?.partOfSpeech ?? normalizeRelycPartOfSpeech(entry.pos)
  const semanticAssist = !hasRussianDefinition && isRussianInput
    ? buildSemanticAssistFromEnglish(normalizedWord, partOfSpeech, englishDefinitions)
    : null

  const definition = override
    ? override.definition
    : semanticAssist
    ? semanticAssist.definition
    : isRussianInput && !hasRussianDefinition
      ? ''
      : definitions[0] ?? ''
  const simpleExplanation = override
    ? override.simpleExplanation
    : semanticAssist
    ? semanticAssist.simpleExplanation
    : isRussianInput && !hasRussianDefinition
      ? `Для слова «${normalizedWord}» найдена словарная статья без полного толкования на русском языке.`
      : entry.ipa
        ? `Определение получено из Wiktionary. IPA: ${entry.ipa}.`
        : 'Определение получено из Wiktionary.'

  const baseData: WordData = {
    word: normalizedWord,
    definition,
    simpleExplanation,
    partOfSpeech,
    examples: override?.examples ?? semanticAssist?.examples ?? [],
    style: [],
    usageTips: [],
    mistakes: [],
    // Формы слова часто дают морфологический шум, а не семантические связи.
    relatedWords: override?.relatedWords ?? semanticAssist?.relatedWords ?? [],
    source: override
      ? 'local_override'
      : semanticAssist
      ? 'semantic_assist'
      : 'api',
  }

  return ensureCompleteWordData(query, mergeWithHints(baseData, query))
}

export async function fetchFromRelycDictionaryApi(
  query: string,
  signal?: AbortSignal,
): Promise<WordData | null> {
  const response = await fetchWithResilience(
    `${RELYC_DICTIONARY_API_BASE_URL}?word=${encodeURIComponent(query)}`,
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
  const payload = parseRelycPayload(rawPayload)
  if (!payload) {
    throw new DictionaryError('Некорректный ответ словарного сервиса.', 'UNKNOWN')
  }

  return fromRelycDictionaryResponse(query, payload)
}
