import { localDictionary } from '../../data/localDictionary'
import { russianSemanticMap } from '../../data/russianSemanticMap'
import { styleHints } from '../../data/styleHints'

function capitalize(value: string): string {
  if (!value) {
    return value
  }

  return value[0].toUpperCase() + value.slice(1)
}

function looksLikeRussianVerbInfinitive(query: string): boolean {
  const normalized = query.trim().toLowerCase()
  return /(ть|ти|чь)$/.test(normalized)
}

function buildNaturalRussianExamples(query: string, partOfSpeech?: string): string[] {
  const word = query.trim()
  const titleWord = capitalize(word)
  const normalizedPos = partOfSpeech?.trim().toLowerCase()
  const isVerb = normalizedPos === 'verb' || looksLikeRussianVerbInfinitive(word)

  if (isVerb) {
    return [
      `Он любит ${word} по утрам в парке.`,
      `Мы начали ${word} сразу после разминки.`,
    ]
  }

  if (normalizedPos === 'adjective') {
    return [
      `Этот пример звучит ${word} в новом тексте.`,
      `Его тон стал ${word} и спокойным.`,
    ]
  }

  return [
    `${titleWord} оказался важен в этом разговоре.`,
    `Мы заметили ${word} сразу у входа.`,
  ]
}

export function getFallbackExamples(query: string, isRussianInput: boolean): string[] {
  if (isRussianInput) {
    return buildNaturalRussianExamples(query)
  }

  return [
    `The word "${query}" should match the context and register of your sentence.`,
    `Before using "${query}", check whether the meaning fits your exact idea.`,
  ]
}

export function getFallbackRelatedWords(query: string): string[] {
  const semantic = russianSemanticMap[query]
  if (semantic && semantic.length > 0) {
    return semantic
  }

  const hinted = styleHints[query]?.relatedWords
  if (hinted && hinted.length > 0) {
    return hinted
  }

  const localMatch = Object.values(localDictionary).find((item) => item.word === query)
  if (localMatch && localMatch.relatedWords.length > 0) {
    return localMatch.relatedWords
  }

  return []
}

export function getContextualExamples(
  query: string,
  isRussianInput: boolean,
  partOfSpeech?: string,
): string[] {
  if (isRussianInput) {
    return buildNaturalRussianExamples(query, partOfSpeech)
  }

  return [
    `In this sentence, the word "${query}" is used in a neutral context.`,
    `The exact meaning of "${query}" is clarified by nearby words in the paragraph.`,
  ]
}

function getMeaningAwareUsageTips(
  query: string,
  isRussianInput: boolean,
  partOfSpeech?: string,
): string[] {
  if (isRussianInput) {
    if (partOfSpeech === 'noun') {
      return [
        `Проверь, какое именно значение существительного «${query}» требуется в текущем контексте.`,
        'Уточняй лексическое значение по словарю, если у слова есть несколько смыслов.',
      ]
    }

    if (partOfSpeech === 'verb') {
      return [
        `Убедись, что глагол «${query}» согласуется с подлежащим и временем в предложении.`,
        'Проверь, не заменяет ли глагол более точный по смыслу вариант.',
      ]
    }

    return [
      `Проверь значение слова «${query}» в полном предложении, а не изолированно.`,
      'Сверяй стилистический регистр слова с жанром текста.',
    ]
  }

  return [
    `Check the exact sense of "${query}" in full sentence context.`,
    'Make sure the register matches your target audience and writing style.',
  ]
}

function getRussianPartOfSpeechLabel(partOfSpeech?: string): string | undefined {
  if (!partOfSpeech) {
    return undefined
  }

  const normalized = partOfSpeech.trim().toLowerCase()
  const map: Record<string, string> = {
    noun: 'существительное',
    verb: 'глагол',
    adjective: 'прилагательное',
    adverb: 'наречие',
    pronoun: 'местоимение',
    preposition: 'предлог',
    conjunction: 'союз',
    interjection: 'междометие',
    particle: 'частица',
    numeral: 'числительное',
  }

  return map[normalized] ?? partOfSpeech
}

export function buildFallbackDefinition(
  query: string,
  isRussianInput: boolean,
  partOfSpeech: string | undefined,
): string {
  if (isRussianInput) {
    const readablePart = getRussianPartOfSpeechLabel(partOfSpeech)
    if (readablePart) {
      return `Точное толкование для слова «${query}» не найдено, поэтому показано общее пояснение. По доступным данным это ${readablePart}.`
    }

    return `Точное толкование для слова «${query}» не найдено, поэтому показано общее пояснение. Уточни значение по контексту и толковому словарю.`
  }

  if (partOfSpeech) {
    return `No reliable dictionary definition was found for "${query}". Known part of speech: ${partOfSpeech}; verify meaning in context.`
  }

  return `No reliable dictionary definition was found for "${query}". Verify meaning in context or another trusted dictionary.`
}

export function buildFallbackSimpleExplanation(
  query: string,
  isRussianInput: boolean,
): string {
  if (isRussianInput) {
    return `Смысл слова «${query}» лучше проверять в полном предложении и с учетом жанра текста.`
  }

  return `The meaning of "${query}" should be validated in full sentence context.`
}

export function buildFallbackUsageTips(
  query: string,
  isRussianInput: boolean,
  partOfSpeech?: string,
): string[] {
  return getMeaningAwareUsageTips(query, isRussianInput, partOfSpeech)
}

export function buildFallbackMistakes(query: string, isRussianInput: boolean): string[] {
  if (isRussianInput) {
    return [`Подстановка слова «${query}» без проверки контекста и смыслового оттенка.`]
  }

  return [`Using "${query}" without validating context and register.`]
}

export function isGeneratedExample(example: string, query: string): boolean {
  const normalized = example.trim().toLowerCase()
  const normalizedQuery = query.trim().toLowerCase()

  return (
    normalized.startsWith('общее пояснение:') ||
    normalized.startsWith('типичный контекст:') ||
    normalized.startsWith('пример употребления:') ||
    normalized.startsWith('нейтральный пример:') ||
    normalized.includes('значение слова') ||
    normalized.includes(`слово «${normalizedQuery}» употребляется`) ||
    normalized.includes(`перед использованием «${normalizedQuery}»`) ||
    normalized.includes(`the word "${normalizedQuery}" should match`) ||
    normalized.includes(`before using "${normalizedQuery}"`)
  )
}

export function generateRelatedWords(query: string, isRussianInput: boolean): string[] {
  const knownRelated = getFallbackRelatedWords(query)
  if (knownRelated.length > 0) {
    return knownRelated.slice(0, 8)
  }

  if (isRussianInput) {
    return []
  }

  return []
}
