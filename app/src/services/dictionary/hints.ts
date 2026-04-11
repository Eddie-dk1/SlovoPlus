import { styleHints } from '../../data/styleHints'
import type { WordData } from '../../types/word'

export function mergeWithHints(data: WordData, query: string): WordData {
  const hints = styleHints[query]

  if (!hints) {
    return data
  }

  return {
    ...data,
    style: hints.style ?? data.style,
    usageTips: hints.usageTips ?? data.usageTips,
    mistakes: hints.mistakes ?? data.mistakes,
    relatedWords: hints.relatedWords ?? data.relatedWords,
  }
}
