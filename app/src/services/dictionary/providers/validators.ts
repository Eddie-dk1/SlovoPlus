import type {
  DictionaryApiEntry,
  FreeDictionaryResponse,
} from '../../../types/word'

interface YandexDictionaryResponse {
  def?: Array<{
    text?: string
    pos?: string
    tr?: Array<{
      text?: string
      pos?: string
      syn?: Array<{ text?: string }>
      mean?: Array<{ text?: string }>
      ex?: Array<{
        text?: string
        tr?: Array<{ text?: string }>
      }>
    }>
  }>
}

interface RelycDictionaryResponse {
  word?: string
  entries?: Array<{
    lang?: string
    lemma?: string
    pos?: string
    ipa?: string
    definitions?: Array<{
      locale?: string
      definitions?: string[]
    }>
    forms?: Array<{
      form?: string
      tag?: string
    }>
  }>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString)
}

function isLanguageObject(value: unknown): boolean {
  if (!isRecord(value)) {
    return false
  }

  return (
    (value.code === undefined || isString(value.code)) &&
    (value.name === undefined || isString(value.name))
  )
}

function isFreeDictionarySense(value: unknown): boolean {
  if (!isRecord(value)) {
    return false
  }

  return (
    (value.definition === undefined || isString(value.definition)) &&
    (value.examples === undefined || isStringArray(value.examples)) &&
    (value.synonyms === undefined || isStringArray(value.synonyms))
  )
}

function isFreeDictionaryEntry(value: unknown): boolean {
  if (!isRecord(value)) {
    return false
  }

  return (
    (value.language === undefined || isLanguageObject(value.language)) &&
    (value.partOfSpeech === undefined || isString(value.partOfSpeech)) &&
    (value.senses === undefined ||
      (Array.isArray(value.senses) && value.senses.every(isFreeDictionarySense))) &&
    (value.synonyms === undefined || isStringArray(value.synonyms))
  )
}

export function parseYandexPayload(raw: unknown): YandexDictionaryResponse | null {
  if (!isRecord(raw)) {
    return null
  }

  if (raw.def !== undefined && !Array.isArray(raw.def)) {
    return null
  }

  return raw as YandexDictionaryResponse
}

export function parseFreeDictionaryPayload(raw: unknown): FreeDictionaryResponse | null {
  if (!isRecord(raw)) {
    return null
  }

  if (raw.word !== undefined && !isString(raw.word)) {
    return null
  }

  if (raw.entries !== undefined && !Array.isArray(raw.entries)) {
    return null
  }

  if (Array.isArray(raw.entries) && !raw.entries.every(isFreeDictionaryEntry)) {
    return null
  }

  return raw as FreeDictionaryResponse
}

export function parseLegacyPayload(raw: unknown): DictionaryApiEntry[] | null {
  if (!Array.isArray(raw)) {
    return null
  }

  if (!raw.every((item) => isRecord(item))) {
    return null
  }

  return raw as DictionaryApiEntry[]
}

export function parseExamplesPayload(raw: unknown): string[] | null {
  const payload = parseFreeDictionaryPayload(raw)
  if (!payload) {
    return null
  }

  if (!payload.entries) {
    return []
  }

  const examples: string[] = []
  for (const entry of payload.entries) {
    if (!Array.isArray(entry.senses)) {
      continue
    }

    for (const sense of entry.senses) {
      if (isStringArray(sense.examples)) {
        examples.push(...sense.examples)
      }
    }
  }

  return examples
}

export function parseRelycPayload(raw: unknown): RelycDictionaryResponse | null {
  if (!isRecord(raw)) {
    return null
  }

  if (raw.word !== undefined && typeof raw.word !== 'string') {
    return null
  }

  if (raw.entries !== undefined && !Array.isArray(raw.entries)) {
    return null
  }

  return raw as RelycDictionaryResponse
}

export type { YandexDictionaryResponse }
export type { RelycDictionaryResponse }
