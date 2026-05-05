import type { WordData, WordLanguage } from '../../../types/word'
import { mergeWithHints } from '../hints'
import { fetchWithResilience } from '../http'
import { ensureCompleteWordData, pickBestExamples, sanitizeRelatedWords } from '../normalizers'
import { isAcceptableDefinition } from '../utils/script'
import { uniqueValues } from '../utils/collections'

interface EnglishDefinitionItem {
  definition?: string
  examples?: string[]
  parsedExamples?: Array<{ example?: string }>
}

interface EnglishDefinitionGroup {
  partOfSpeech?: string
  definitions?: EnglishDefinitionItem[]
}

type EnglishDefinitionPayload = Record<string, EnglishDefinitionGroup[] | undefined>

const PART_OF_SPEECH_BY_RUSSIAN_TEXT: Array<[RegExp, string]> = [
  [/существительное/i, 'noun'],
  [/глагол/i, 'verb'],
  [/прилагательное/i, 'adjective'],
  [/наречие/i, 'adverb'],
  [/местоимение/i, 'pronoun'],
  [/предлог/i, 'preposition'],
  [/союз/i, 'conjunction'],
  [/междометие/i, 'interjection'],
  [/частица/i, 'particle'],
  [/числительное/i, 'numeral'],
]

function decodeHtmlEntities(value: string): string {
  const namedEntities: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    shy: '',
  }

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    const normalized = entity.toLowerCase()
    if (normalized.startsWith('#x')) {
      const codePoint = Number.parseInt(normalized.slice(2), 16)
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match
    }

    if (normalized.startsWith('#')) {
      const codePoint = Number.parseInt(normalized.slice(1), 10)
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match
    }

    return namedEntities[normalized] ?? match
  })
}

function stripHtml(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<link\b[^>]*>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
}

function cleanText(value: string): string {
  return stripHtml(value)
    .replace(/◆/g, ' ')
    .replace(/\[(?:править|edit)\]/gi, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanDefinition(value: string, language: WordLanguage): string {
  const cleaned = cleanText(value)
    .replace(/\(Can we add an example for this sense\?\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  return isAcceptableDefinition(cleaned, language === 'ru') ? cleaned : ''
}

function extractLinkTitles(value: string, language: WordLanguage): string[] {
  const pattern = /<a\b[^>]*(?:title|href)="\.?\/?([^"#?]+)"[^>]*>([\s\S]*?)<\/a>/gi
  const results: string[] = []
  let match: RegExpExecArray | null

  while ((match = pattern.exec(value))) {
    const raw = decodeURIComponent(match[1] ?? '')
    const label = cleanText(match[2] ?? '')
    const candidate = label || raw.replace(/_/g, ' ')
    const normalized = candidate.trim()

    if (
      (language === 'ru' && /^[а-яё -]+$/i.test(normalized)) ||
      (language === 'en' && /^[a-z -]+$/i.test(normalized))
    ) {
      results.push(normalized.toLowerCase())
    }
  }

  return results
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseEnglishDefinitionPayload(raw: unknown): EnglishDefinitionPayload | null {
  if (!isRecord(raw)) {
    return null
  }

  return raw as EnglishDefinitionPayload
}

export function fromEnglishWiktionaryDefinition(
  query: string,
  rawPayload: unknown,
): WordData | null {
  const payload = parseEnglishDefinitionPayload(rawPayload)
  const entries = payload?.en ?? []

  if (entries.length === 0) {
    return null
  }

  for (const entry of entries) {
    const definitions = Array.isArray(entry.definitions) ? entry.definitions : []
    const firstDefinition = definitions
      .map((item) => cleanDefinition(item.definition ?? '', 'en'))
      .find(Boolean)

    if (!firstDefinition) {
      continue
    }

    const examples = uniqueValues(
      definitions.flatMap((item) => [
        ...(item.parsedExamples ?? []).map((example) => example.example ?? ''),
        ...(item.examples ?? []),
      ]),
      8,
    )
    const relatedWords = sanitizeRelatedWords(
      query,
      uniqueValues(definitions.flatMap((item) => extractLinkTitles(item.definition ?? '', 'en')), 16),
      false,
    )

    return ensureCompleteWordData(
      query,
      mergeWithHints(
        {
          word: query,
          language: 'en',
          definition: firstDefinition,
          simpleExplanation: 'Definition is based on Wiktionary data.',
          partOfSpeech: entry.partOfSpeech?.toLowerCase(),
          examples: pickBestExamples(query, false, entry.partOfSpeech, examples.map(cleanText)),
          style: [],
          usageTips: [],
          mistakes: [],
          relatedWords,
          source: 'api',
        },
        query,
      ),
    )
  }

  return null
}

function extractLanguageSection(html: string, languageHeading: string): string {
  const headingPattern = new RegExp(`<h1\\b[^>]*>[\\s\\S]*?${languageHeading}[\\s\\S]*?<\\/h1>`, 'i')
  const match = headingPattern.exec(html)

  if (!match) {
    return html
  }

  const start = match.index + match[0].length
  const nextHeading = html.slice(start).search(/<h1\b/i)
  return nextHeading >= 0 ? html.slice(start, start + nextHeading) : html.slice(start)
}

function extractSectionByHeading(html: string, heading: string): string {
  const headingPattern = new RegExp(`<h[34]\\b[^>]*>[\\s\\S]*?${heading}[\\s\\S]*?<\\/h[34]>`, 'i')
  const match = headingPattern.exec(html)

  if (!match) {
    return ''
  }

  const start = match.index + match[0].length
  const rest = html.slice(start)
  const nextSection = rest.search(/<\/section>\s*<section\b/i)
  if (nextSection >= 0) {
    return rest.slice(0, nextSection)
  }

  const nextHeading = rest.search(/<h[34]\b/i)
  return nextHeading >= 0 ? rest.slice(0, nextHeading) : rest
}

function extractListItems(html: string): string[] {
  const orderedList = /<ol\b[\s\S]*?<\/ol>/i.exec(html)?.[0] ?? html
  const items: string[] = []
  const itemPattern = /<li\b[^>]*>[\s\S]*?<\/li>/gi
  let match: RegExpExecArray | null

  while ((match = itemPattern.exec(orderedList))) {
    items.push(match[0])
  }

  return items
}

function extractRussianPartOfSpeech(section: string): string | undefined {
  const morphology = extractSectionByHeading(section, 'Морфологические')
  const text = cleanText(morphology)
  const match = PART_OF_SPEECH_BY_RUSSIAN_TEXT.find(([pattern]) => pattern.test(text))

  return match?.[1]
}

function extractRussianExamples(itemHtml: string): string[] {
  const text = stripHtml(itemHtml)
    .replace(/\s+/g, ' ')
    .trim()
  const parts = text.split('◆').map((part) => part.trim()).filter(Boolean)

  if (parts.length <= 1) {
    return []
  }

  return parts
    .slice(1)
    .map((part) => part.replace(/\s+$/, '').trim())
    .filter((part) => part.length > 0)
}

function extractRussianDefinition(itemHtml: string): string {
  const withoutExamples = itemHtml.split(/<span\b[^>]*class="[^"]*example-fullblock/iu)[0] ?? ''
  return cleanDefinition(withoutExamples, 'ru')
}

function extractRussianSynonyms(section: string): string[] {
  const synonymSection = extractSectionByHeading(section, 'Синонимы')

  return extractListItems(synonymSection)
    .flatMap((item) => cleanText(item).split(/[,;]/))
    .map((item) => item.trim())
    .filter((item) => /^[а-яё -]+$/i.test(item) && item !== '—')
}

export function fromRussianWiktionaryHtml(query: string, html: string): WordData | null {
  const russianSection = extractLanguageSection(html, 'Русский')
  const meaningSection = extractSectionByHeading(russianSection, 'Значение')
  const meaningItems = extractListItems(meaningSection)
  const firstDefinition = meaningItems
    .map(extractRussianDefinition)
    .find((definition) => isAcceptableDefinition(definition, true))

  if (!firstDefinition) {
    return null
  }

  const examples = uniqueValues(meaningItems.flatMap(extractRussianExamples), 8)
  const relatedWords = sanitizeRelatedWords(
    query,
    extractRussianSynonyms(russianSection),
    true,
  )
  const partOfSpeech = extractRussianPartOfSpeech(russianSection)

  return ensureCompleteWordData(
    query,
    mergeWithHints(
      {
        word: query,
        language: 'ru',
        definition: firstDefinition,
        simpleExplanation: 'Толкование и примеры получены из русской статьи Викисловаря.',
        partOfSpeech,
        examples: pickBestExamples(query, true, partOfSpeech, examples),
        style: [],
        usageTips: [],
        mistakes: [],
        relatedWords,
        source: 'api',
      },
      query,
    ),
  )
}

export async function fetchFromWiktionaryApi(
  query: string,
  language: WordLanguage,
  signal?: AbortSignal,
): Promise<WordData | null> {
  const host = language === 'ru' ? 'ru.wiktionary.org' : 'en.wiktionary.org'
  const path =
    language === 'ru'
      ? `/api/rest_v1/page/html/${encodeURIComponent(query)}`
      : `/api/rest_v1/page/definition/${encodeURIComponent(query)}`
  const response = await fetchWithResilience(`https://${host}${path}`, {
    signal,
    headers: {
      'Api-User-Agent': 'SlovoPlus/0.1 (educational dictionary app)',
    },
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    return null
  }

  if (language === 'ru') {
    return fromRussianWiktionaryHtml(query, await response.text())
  }

  return fromEnglishWiktionaryDefinition(query, await response.json())
}
