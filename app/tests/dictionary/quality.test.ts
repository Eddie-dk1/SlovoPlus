import assert from 'node:assert/strict'
import test from 'node:test'
import { detectWordDataQualityTier, isBetterWordDataCandidate } from '../../src/services/dictionary/quality'
import type { WordData } from '../../src/types/word'

function buildWordData(overrides: Partial<WordData>): WordData {
  return {
    word: 'телефон',
    definition: '',
    simpleExplanation: '',
    partOfSpeech: 'noun',
    examples: [],
    style: ['нейтральное'],
    usageTips: [],
    mistakes: [],
    relatedWords: [],
    source: 'fallback',
    ...overrides,
  }
}

test('detectWordDataQualityTier classifies technical fallback as fallback tier', () => {
  const data = buildWordData({
    definition:
      'Точное толкование для слова «телефон» не найдено, поэтому показано общее пояснение.',
    examples: ['Общее пояснение: слово «телефон» употребляется в зависимости от контекста.'],
    source: 'api',
  })

  assert.equal(detectWordDataQualityTier('телефон', data), 'fallback')
})

test('detectWordDataQualityTier classifies semantic assist as semantic tier', () => {
  const data = buildWordData({
    definition: '«телефон» - устройство для связи и передачи речи на расстоянии.',
    examples: ['Типичный контекст: слово «телефон» связано со связью и звонками.'],
    source: 'semantic_assist',
  })

  assert.equal(detectWordDataQualityTier('телефон', data), 'semantic')
})

test('isBetterWordDataCandidate prefers higher tier dictionary result', () => {
  const semantic = buildWordData({
    definition: '«телефон» - устройство для связи и передачи речи на расстоянии.',
    source: 'semantic_assist',
  })
  const dictionary = buildWordData({
    definition: 'Аппарат для передачи и приема звуковой речи на расстоянии.',
    examples: ['Она оставила телефон дома перед поездкой в университет.'],
    source: 'api',
  })

  assert.equal(isBetterWordDataCandidate('телефон', dictionary, semantic), true)
})
