import assert from 'node:assert/strict'
import test from 'node:test'
import { ensureCompleteWordData, pickBestExamples, sanitizeRelatedWords } from '../../src/services/dictionary/normalizers'
import { isAcceptableDefinition } from '../../src/services/dictionary/utils/script'
import type { WordData } from '../../src/types/word'

test('isAcceptableDefinition validates Russian and English definitions', () => {
  assert.equal(isAcceptableDefinition('Это корректное русское определение.', true), true)
  assert.equal(isAcceptableDefinition('sea', true), false)
  assert.equal(isAcceptableDefinition('A clear english definition.', false), true)
})

test('sanitizeRelatedWords removes self-reference and invalid script items', () => {
  const related = sanitizeRelatedWords(
    'ирония',
    ['ирония', 'насмешка', 'sarcasm', 'насмешка'],
    true,
  )

  assert.equal(related.includes('ирония'), false)
  assert.equal(related.includes('sarcasm'), false)
  assert.equal(related.includes('насмешка'), true)
})

test('pickBestExamples prefers non-generated examples and falls back to secondary', () => {
  const picked = pickBestExamples(
    'тест',
    true,
    undefined,
    ['Слово «тест» употребляется в зависимости от контекста и жанра текста.'],
    ['В этом примере слово тест употреблено в естественном контексте.'],
  )

  assert.equal(
    picked.includes('В этом примере слово тест употреблено в естественном контексте.'),
    true,
  )
})

test('ensureCompleteWordData fills missing required fields safely', () => {
  const partial: WordData = {
    word: '',
    definition: '',
    simpleExplanation: '',
    partOfSpeech: undefined,
    examples: [],
    style: [],
    usageTips: [],
    mistakes: [],
    relatedWords: [],
    source: 'fallback',
  }

  const complete = ensureCompleteWordData('ирония', partial)

  assert.equal(complete.word, 'ирония')
  assert.equal(complete.style[0], 'нейтральное')
  assert.match(complete.definition, /не найдено/i)
  assert.equal(complete.examples.length > 0, true)
  assert.equal(complete.source, 'fallback')
})

test('ensureCompleteWordData moves generated meta examples out of examples', () => {
  const partial: WordData = {
    word: 'корабль',
    definition: 'Судно для движения по воде.',
    simpleExplanation: 'Корабль используют для перевозки людей и грузов.',
    partOfSpeech: 'noun',
    examples: [
      'Типичный контекст: слово «корабль» связано с плаванием.',
    ],
    style: ['нейтральное'],
    usageTips: [],
    mistakes: [],
    relatedWords: ['судно'],
    source: 'semantic_assist',
  }

  const complete = ensureCompleteWordData('корабль', partial)

  assert.equal(complete.examples.some((item) => /типичный контекст|общее пояснение/i.test(item)), false)
  assert.equal(complete.usageTips.some((tip) => /контексту предложения/i.test(tip)), true)
})
