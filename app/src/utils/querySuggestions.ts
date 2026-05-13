import { searchSuggestionsByLanguage } from '../data/searchSuggestions'
import type { WordLanguage } from '../types/word'

function normalizeQuery(value: string): string {
  return value.trim().toLowerCase()
}

function scoreSuggestion(query: string, suggestion: string): number {
  const normalizedSuggestion = normalizeQuery(suggestion)

  if (normalizedSuggestion === query) {
    return 0
  }

  if (normalizedSuggestion.startsWith(query) || query.startsWith(normalizedSuggestion)) {
    return 3
  }

  if (normalizedSuggestion.includes(query) || query.includes(normalizedSuggestion)) {
    return 2
  }

  const queryLetters = new Set(query)
  const overlap = [...new Set(normalizedSuggestion)].filter((letter) =>
    queryLetters.has(letter),
  ).length

  return overlap >= Math.min(3, query.length) ? 1 : 0
}

export function getQuerySuggestions(
  query: string,
  language: WordLanguage,
  limit = 5,
): string[] {
  const normalizedQuery = normalizeQuery(query)

  if (!normalizedQuery) {
    return []
  }

  return searchSuggestionsByLanguage[language]
    .map((suggestion) => ({
      suggestion,
      score: scoreSuggestion(normalizedQuery, suggestion),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.suggestion.localeCompare(right.suggestion))
    .slice(0, limit)
    .map((item) => item.suggestion)
}
