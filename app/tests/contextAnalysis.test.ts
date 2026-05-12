import assert from 'node:assert/strict'
import test from 'node:test'
import { analyzeWordUsageInSentence } from '../src/utils/contextAnalysis'

test('returns honest message for empty sentence', () => {
  const result = analyzeWordUsageInSentence('типа', ['разговорное'], '')

  assert.equal(result.register, 'neutral')
  assert.equal(result.matched, false)
  assert.match(result.summary, /Недостаточно данных/)
})

test('detects conflict between formal context and colloquial style', () => {
  const sentence = 'В соответствии с регламентом типа требуется уточнение формулировки.'
  const result = analyzeWordUsageInSentence('типа', ['разговорное'], sentence)

  assert.equal(result.register, 'mixed')
  assert.equal(result.matched, true)
  assert.match(result.summary, /смешаны разговорные и формальные маркеры/i)
  assert.equal(result.reasons.some((reason) => /формальные маркеры/i.test(reason)), true)
})

test('reports missing word directly when token is absent', () => {
  const sentence = 'Необходимо уточнить формулировку перед публикацией.'
  const result = analyzeWordUsageInSentence('ирония', ['публицистическое'], sentence)

  assert.equal(result.matched, false)
  assert.match(result.summary, /не найдено/i)
})

test('detects simple russian word forms without substring matches', () => {
  const result = analyzeWordUsageInSentence(
    'дом',
    ['нейтральное'],
    'Возле дома стояли старые деревья.',
  )

  assert.equal(result.matched, true)
  assert.equal(result.matchedForm, 'дома')
  assert.match(result.reasons.join(' '), /словоформа/i)

  const absent = analyzeWordUsageInSentence(
    'дом',
    ['нейтральное'],
    'Домино лежало на столе.',
  )
  assert.equal(absent.matched, false)
})

test('detects english forms and keeps english markers separate', () => {
  const result = analyzeWordUsageInSentence(
    'study',
    ['нейтральное'],
    'Therefore, the student studies the issue carefully.',
    'en',
  )

  assert.equal(result.matched, true)
  assert.equal(result.matchedForm, 'studies')
  assert.equal(result.register, 'formal')
  assert.equal(result.reasons.some((reason) => /formal markers/i.test(reason)), true)
})

test('does not match english word inside another token', () => {
  const result = analyzeWordUsageInSentence(
    'ship',
    ['нейтральное'],
    'Friendship requires attention.',
    'en',
  )

  assert.equal(result.matched, false)
})
