import type { WordData } from '../../types/word'
import { isGeneratedExample } from './fallbacks'
import { countWords, hasCyrillic, hasLatin, isAcceptableDefinition } from './utils/script'

export type WordDataQualityTier = 'fallback' | 'semantic' | 'dictionary'

const TECHNICAL_DEFINITION_PATTERNS = [
  /точное толкование.*не найдено/i,
  /словарн(?:ая|ое) стать(?:я|е).*без полного толкования/i,
  /no reliable dictionary definition was found/i,
]

function isTechnicalDefinition(definition: string): boolean {
  const normalized = definition.trim()
  if (!normalized) {
    return true
  }

  return TECHNICAL_DEFINITION_PATTERNS.some((pattern) => pattern.test(normalized))
}

function hasNaturalExamples(query: string, examples: string[], isRussianInput: boolean): boolean {
  return examples.some((example) => {
    const normalized = example.trim()
    if (!normalized || isGeneratedExample(normalized, query)) {
      return false
    }

    if (normalized.startsWith('Общее пояснение:')) {
      return false
    }

    if (isRussianInput) {
      return hasCyrillic(normalized) && countWords(normalized) >= 3
    }

    return hasLatin(normalized) && countWords(normalized) >= 3
  })
}

function getTierRank(tier: WordDataQualityTier): number {
  const tierRank: Record<WordDataQualityTier, number> = {
    fallback: 0,
    semantic: 1,
    dictionary: 2,
  }

  return tierRank[tier]
}

export function detectWordDataQualityTier(
  query: string,
  data: WordData,
): WordDataQualityTier {
  const isRussianInput = /[а-яё]/i.test(query)
  const hasGoodDefinition =
    isAcceptableDefinition(data.definition, isRussianInput) &&
    !isTechnicalDefinition(data.definition)
  const hasGoodExamples = hasNaturalExamples(query, data.examples, isRussianInput)

  if (!hasGoodDefinition) {
    return 'fallback'
  }

  if (data.source === 'api' || data.source === 'local_override') {
    return hasGoodExamples ? 'dictionary' : 'semantic'
  }

  if (data.source === 'semantic_assist') {
    return 'semantic'
  }

  return 'fallback'
}

export function isTierAtLeast(
  tier: WordDataQualityTier,
  minimum: WordDataQualityTier,
): boolean {
  return getTierRank(tier) >= getTierRank(minimum)
}

export function isBetterWordDataCandidate(
  query: string,
  nextCandidate: WordData,
  currentBest: WordData | null,
): boolean {
  if (!currentBest) {
    return true
  }

  const nextTier = detectWordDataQualityTier(query, nextCandidate)
  const currentTier = detectWordDataQualityTier(query, currentBest)
  const nextRank = getTierRank(nextTier)
  const currentRank = getTierRank(currentTier)

  if (nextRank !== currentRank) {
    return nextRank > currentRank
  }

  const nextDefinitionLength = nextCandidate.definition.trim().length
  const currentDefinitionLength = currentBest.definition.trim().length
  if (nextDefinitionLength !== currentDefinitionLength) {
    return nextDefinitionLength > currentDefinitionLength
  }

  return nextCandidate.examples.length > currentBest.examples.length
}
