import assert from 'node:assert/strict'
import test from 'node:test'
import { getReplacementSuggestions } from '../src/data/replacementSuggestions'
import { fetchWordData } from '../src/services/dictionary'

test('local dictionary covers learn category phrases without remote lookup', async () => {
  const entries = await Promise.all([
    fetchWordData('как бы'),
    fetchWordData('в рамках'),
    fetchWordData('надлежит'),
    fetchWordData('одеть'),
    fetchWordData('гипербола'),
  ])

  assert.equal(entries.every((entry) => entry.sourceProvider === 'local'), true)
  assert.equal(entries.every((entry) => entry.source === 'local_override'), true)
  assert.equal(entries.every((entry) => entry.examples.length > 0), true)
})

test('local paronym entries explain the odet/nadet distinction', async () => {
  const odet = await fetchWordData('одеть')
  const nadet = await fetchWordData('надеть')

  assert.match(odet.mistakes.join(' '), /надеть/i)
  assert.match(nadet.mistakes.join(' '), /одеть/i)
})

test('replacement suggestions include additional bureaucratic phrases', async () => {
  const data = await fetchWordData('в рамках')
  const suggestions = getReplacementSuggestions(data, 'ru')

  assert.equal(suggestions.some((item) => item.phrase === 'в рамках'), true)
  assert.equal(
    suggestions.some((item) => item.replacements.includes('во время')),
    true,
  )
})
