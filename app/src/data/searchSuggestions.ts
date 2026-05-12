import { categories } from './categories'
import { localDictionary } from './localDictionary'
import { russianSemanticMap } from './russianSemanticMap'
import type { WordLanguage } from '../types/word'

const categoryTerms = categories.flatMap((category) =>
  category.examples.map((example) => example.split('/')[0].trim()),
)

const baseRussianWords = [
  'лексика',
  'контекст',
  'сарказм',
  'стиль',
  'публицистика',
  'канцеляризм',
  'метафора',
  'гипербола',
]

const englishCategoryTerms = categories.flatMap((category) => category.examplesEn)

const baseEnglishWords = [
  'vocabulary',
  'context',
  'irony',
  'sarcasm',
  'style',
  'metaphor',
  'hyperbole',
  'thesis',
  'argument',
  'clarity',
  'formal',
  'informal',
]

export const russianSearchSuggestions = Array.from(
  new Set([
    ...Object.keys(localDictionary),
    ...Object.keys(russianSemanticMap),
    ...categoryTerms,
    ...baseRussianWords,
  ]),
)

export const englishSearchSuggestions = Array.from(
  new Set([...englishCategoryTerms, ...baseEnglishWords]),
)

export const searchSuggestionsByLanguage: Record<WordLanguage, string[]> = {
  ru: russianSearchSuggestions,
  en: englishSearchSuggestions,
}

export const searchSuggestions = russianSearchSuggestions
