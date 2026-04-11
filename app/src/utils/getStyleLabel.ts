import type { WordStyle } from '../types/word'

const styleLabelMap: Record<WordStyle, string> = {
  нейтральное: 'Нейтральное',
  разговорное: 'Разговорное',
  книжное: 'Книжное',
  'официально-деловое': 'Официально-деловое',
  публицистическое: 'Публицистическое',
}

export function getStyleLabel(style: WordStyle): string {
  return styleLabelMap[style]
}
