import { buildSemanticAssistFromPatterns, type SemanticAssistResult } from './semanticPatterns'

function capitalize(value: string): string {
  if (!value) {
    return value
  }

  return value[0].toUpperCase() + value.slice(1)
}

function buildNaturalSemanticExamples(word: string, partOfSpeech: string | undefined): string[] {
  const normalizedPos = partOfSpeech?.trim().toLowerCase()
  const titleWord = capitalize(word)

  if (normalizedPos === 'verb') {
    return [
      `Он любит ${word} по утрам в парке.`,
      `Мы начали ${word} после короткого сигнала.`,
    ]
  }

  if (normalizedPos === 'adjective') {
    return [
      `Этот выбор выглядит ${word} для читателя.`,
      `Его ответ прозвучал ${word} и точно.`,
    ]
  }

  return [
    `${titleWord} оказался важен в этом разговоре.`,
    `Мы заметили ${word} сразу после начала.`,
  ]
}

function enrichSemanticExamples(word: string, partOfSpeech: string | undefined, examples: string[]): string[] {
  const hasMetaExamples = examples.some((example) => {
    const normalized = example.trim().toLowerCase()
    return (
      normalized.startsWith('общее пояснение:') ||
      normalized.startsWith('типичный контекст:') ||
      normalized.startsWith('пример употребления:') ||
      normalized.startsWith('нейтральный пример:')
    )
  })

  if (hasMetaExamples || examples.length === 0) {
    return buildNaturalSemanticExamples(word, partOfSpeech)
  }

  return examples
}

export function buildSemanticAssistFromEnglish(
  word: string,
  partOfSpeech: string | undefined,
  englishDefinitions: string[],
): SemanticAssistResult | null {
  const result = buildSemanticAssistFromPatterns(word, partOfSpeech, englishDefinitions)
  if (!result) {
    return null
  }

  return {
    ...result,
    examples: enrichSemanticExamples(word, partOfSpeech, result.examples),
  }
}
