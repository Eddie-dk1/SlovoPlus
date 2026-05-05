import { localDictionary } from '../../data/localDictionary'
import { russianSemanticMap } from '../../data/russianSemanticMap'
import { styleHints } from '../../data/styleHints'
import type { WordData } from '../../types/word'
import {
  buildFallbackDefinition,
  buildFallbackMistakes,
  buildFallbackSimpleExplanation,
  buildFallbackUsageTips,
  generateRelatedWords,
  getContextualExamples,
  getFallbackExamples,
  getFallbackRelatedWords,
  isGeneratedExample,
} from './fallbacks'
import { normalizeRelatedToken, uniqueValues } from './utils/collections'
import {
  countWords,
  hasExpectedScript,
  isAcceptableDefinition,
  isCyrillicWord,
} from './utils/script'

export function filterByExpectedScript(
  values: string[],
  isRussianInput: boolean,
): string[] {
  return values.filter((value) => hasExpectedScript(value, isRussianInput))
}

export function sanitizeRelatedWords(
  query: string,
  candidates: string[],
  isRussianInput: boolean,
): string[] {
  const isAcceptableRelatedCandidate = (item: string): boolean => {
    const normalized = normalizeRelatedToken(item)
    const normalizedQuery = normalizeRelatedToken(query)

    if (!normalized || normalized === normalizedQuery) {
      return false
    }

    if (item.length < 3) {
      return false
    }

    // Отбрасываем токены с ударениями/диакритикой и техническим шумом.
    if (/[\u0300-\u036f^*]/.test(item)) {
      return false
    }

    if (isRussianInput) {
      if (!/^[а-яё -]+$/i.test(item)) {
        return false
      }

      // Частая проблема: словоформы типа "бога/богу/богом" вместо связанных слов.
      if (normalized.startsWith(normalizedQuery) || normalizedQuery.startsWith(normalized)) {
        return false
      }
    } else if (!/^[a-z -]+$/i.test(item)) {
      return false
    }

    return true
  }

  const normalizedQuery = normalizeRelatedToken(query)
  const semantic = russianSemanticMap[query] ?? []
  const hinted = styleHints[query]?.relatedWords ?? []
  const local = localDictionary[query]?.relatedWords ?? []

  const merged = uniqueValues([...semantic, ...candidates, ...hinted, ...local], 16)

  const filtered = merged.filter((item) => {
    const normalized = normalizeRelatedToken(item)
    if (!normalized || normalized === normalizedQuery) {
      return false
    }

    if (!hasExpectedScript(item, isRussianInput)) {
      return false
    }

    return isAcceptableRelatedCandidate(item)
  })

  if (filtered.length > 0) {
    return filtered.slice(0, 8)
  }

  return getFallbackRelatedWords(query).slice(0, 8)
}

export function ensureCompleteWordData(query: string, data: WordData): WordData {
  const russianInput = isCyrillicWord(query)
  const language = russianInput ? 'ru' : 'en'
  const relatedWordsFromData = sanitizeRelatedWords(query, data.relatedWords, russianInput)
  const relatedWords =
    relatedWordsFromData.length > 0
      ? relatedWordsFromData
      : generateRelatedWords(query, russianInput)
  const hasAcceptableDefinition = isAcceptableDefinition(data.definition, russianInput)
  const definition = hasAcceptableDefinition
    ? data.definition
    : buildFallbackDefinition(query, russianInput, data.partOfSpeech)

  const filteredExamples = filterByExpectedScript(data.examples, russianInput)
  const naturalExamples = filteredExamples
    .filter((item) => !isGeneratedExample(item, query))
    .slice(0, 3)
  const generatedExamples = filteredExamples
    .filter((item) => isGeneratedExample(item, query))
    .slice(0, 3)

  const examples =
    naturalExamples.length > 0
      ? naturalExamples
      : data.examples.length > 0
        ? getContextualExamples(query, russianInput, data.partOfSpeech)
        : getFallbackExamples(query, russianInput)
  const simpleExplanation =
    data.simpleExplanation &&
    hasExpectedScript(data.simpleExplanation, russianInput)
      ? data.simpleExplanation
      : buildFallbackSimpleExplanation(query, russianInput)
  const generatedExampleTips =
    generatedExamples.length > 0
      ? ['Дополнительное пояснение лучше проверять по полному контексту предложения.']
      : []
  const usageTips = uniqueValues(
    filterByExpectedScript(data.usageTips, russianInput).length > 0
      ? [...filterByExpectedScript(data.usageTips, russianInput), ...generatedExampleTips]
      : [...generatedExampleTips, ...buildFallbackUsageTips(query, russianInput, data.partOfSpeech)],
    6,
  )
  const mistakes =
    filterByExpectedScript(data.mistakes, russianInput).length > 0
      ? filterByExpectedScript(data.mistakes, russianInput)
      : buildFallbackMistakes(query, russianInput)

  return {
    ...data,
    word: data.word || query,
    language,
    definition,
    simpleExplanation,
    examples,
    style: data.style.length > 0 ? data.style : ['нейтральное'],
    usageTips,
    mistakes,
    relatedWords,
    source: hasAcceptableDefinition ? data.source : 'fallback',
  }
}

export function pickBestExamples(
  query: string,
  isRussianInput: boolean,
  partOfSpeech: string | undefined,
  primary: string[],
  secondary: string[] = [],
): string[] {
  const fromPrimary = filterByExpectedScript(primary, isRussianInput)
    .filter((item) => !isGeneratedExample(item, query))
    .filter((item) => countWords(item) >= 3)
  if (fromPrimary.length > 0) {
    return uniqueValues(fromPrimary, 3)
  }

  const fromSecondary = filterByExpectedScript(secondary, isRussianInput)
    .filter((item) => !isGeneratedExample(item, query))
    .filter((item) => countWords(item) >= 3)
  if (fromSecondary.length > 0) {
    return uniqueValues(fromSecondary, 3)
  }

  return getContextualExamples(query, isRussianInput, partOfSpeech)
}
