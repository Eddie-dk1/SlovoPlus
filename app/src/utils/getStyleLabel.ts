import type { WordStyle } from '../types/word'
import type { WordLanguage } from '../types/word'

const russianStyleLabelMap: Record<WordStyle, string> = {
  нейтральное: 'Нейтральное',
  разговорное: 'Разговорное',
  книжное: 'Книжное',
  'официально-деловое': 'Официально-деловое',
  публицистическое: 'Публицистическое',
}

const englishStyleLabelMap: Record<WordStyle, string> = {
  нейтральное: 'Neutral',
  разговорное: 'Informal',
  книжное: 'Literary',
  'официально-деловое': 'Formal',
  публицистическое: 'Journalistic',
}

export function getStyleLabel(style: WordStyle, language: WordLanguage = 'ru'): string {
  return language === 'ru' ? russianStyleLabelMap[style] : englishStyleLabelMap[style]
}
