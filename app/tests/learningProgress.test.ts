import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildLearningProgressKey,
  getCategoryProgress,
  sanitizeLearningProgressState,
  toggleLearningProgressExample,
} from '../src/utils/learningProgress'

const categoryKey = buildLearningProgressKey('ru', 'filler-words')
const examples = ['типа', 'как бы', 'ну']

test('sanitizeLearningProgressState keeps only known category examples', () => {
  const state = sanitizeLearningProgressState(
    {
      [categoryKey]: ['типа', 'мусор', 'типа', '  как бы  '],
      'ru:unknown': ['ну'],
    },
    {
      [categoryKey]: examples,
    },
  )

  assert.deepEqual(state, {
    [categoryKey]: ['типа', 'как бы'],
  })
})

test('toggleLearningProgressExample adds and removes example progress', () => {
  const withExample = toggleLearningProgressExample(
    {},
    categoryKey,
    'типа',
    examples,
  )

  assert.deepEqual(withExample, {
    [categoryKey]: ['типа'],
  })

  const withoutExample = toggleLearningProgressExample(
    withExample,
    categoryKey,
    'типа',
    examples,
  )

  assert.deepEqual(withoutExample, {})
})

test('getCategoryProgress reports percentage and completion status', () => {
  const progress = getCategoryProgress(
    {
      [categoryKey]: ['типа', 'как бы', 'ну'],
    },
    categoryKey,
    examples,
  )

  assert.equal(progress.completedCount, 3)
  assert.equal(progress.totalCount, 3)
  assert.equal(progress.percent, 100)
  assert.equal(progress.isCompleted, true)
})
