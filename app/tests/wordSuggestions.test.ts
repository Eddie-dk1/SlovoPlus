import assert from 'node:assert/strict'
import test from 'node:test'
import { getReplacementSuggestions } from '../src/data/replacementSuggestions'
import { getQuerySuggestions } from '../src/utils/querySuggestions'
import type { WordData } from '../src/types/word'

function buildWordData(overrides: Partial<WordData>): WordData {
  return {
    word: 'осуществлять',
    definition: '',
    simpleExplanation: '',
    partOfSpeech: 'verb',
    examples: [],
    style: ['официально-деловое'],
    usageTips: [],
    mistakes: [],
    relatedWords: [],
    source: 'local_override',
    ...overrides,
  }
}

test('getReplacementSuggestions returns clearer alternatives for bureaucratic words', () => {
  const suggestions = getReplacementSuggestions(
    buildWordData({
      word: 'осуществлять',
      examples: ['Организация будет осуществлять контроль качества.'],
    }),
    'ru',
  )

  assert.equal(suggestions.length > 0, true)
  assert.equal(suggestions[0].replacements.includes('проверять'), true)
})

test('getQuerySuggestions finds close known queries without returning exact match', () => {
  const suggestions = getQuerySuggestions('сарка', 'ru')

  assert.equal(suggestions.includes('сарказм'), true)
  assert.equal(suggestions.includes('сарка'), false)
})
