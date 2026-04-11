import { categories } from './categories'
import { localDictionary } from './localDictionary'
import { russianSemanticMap } from './russianSemanticMap'

const categoryTerms = categories.flatMap((category) =>
  category.examples.map((example) => example.split('/')[0].trim()),
)

const baseWords = [
  'лексика',
  'контекст',
  'сарказм',
  'стиль',
  'публицистика',
  'канцеляризм',
  'метафора',
  'гипербола',
]

export const searchSuggestions = Array.from(
  new Set([
    ...Object.keys(localDictionary),
    ...Object.keys(russianSemanticMap),
    ...categoryTerms,
    ...baseWords,
  ]),
)
