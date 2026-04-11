import assert from 'node:assert/strict'
import test from 'node:test'
import { analyzeWordUsageInSentence } from '../src/utils/contextAnalysis'

test('returns honest message for empty sentence', () => {
  const result = analyzeWordUsageInSentence('типа', ['разговорное'], '')

  assert.equal(result.register, 'neutral')
  assert.match(result.summary, /Недостаточно данных/)
})

test('detects conflict between formal context and colloquial style', () => {
  const sentence = 'В соответствии с регламентом типа требуется уточнение формулировки.'
  const result = analyzeWordUsageInSentence('типа', ['разговорное'], sentence)

  assert.equal(result.register, 'mixed')
  assert.match(result.summary, /смешаны разговорные и формальные маркеры/i)
})

test('reports missing word directly when token is absent', () => {
  const sentence = 'Необходимо уточнить формулировку перед публикацией.'
  const result = analyzeWordUsageInSentence('ирония', ['публицистическое'], sentence)

  assert.match(result.summary, /не найдено/i)
})
