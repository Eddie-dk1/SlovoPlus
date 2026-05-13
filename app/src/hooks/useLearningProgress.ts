import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'
import { categories, type LearnCategory } from '../data/categories'
import type { UiLanguage } from '../i18n/translations'
import {
  buildLearningProgressKey,
  getCategoryProgress,
  readLearningProgressState,
  resetLearningCategoryProgress,
  toggleLearningProgressExample,
  writeLearningProgressState,
  type CategoryProgress,
  type LearningProgressState,
} from '../utils/learningProgress'

const allowedExamplesByKey = categories.reduce<Record<string, readonly string[]>>(
  (examplesByKey, category) => {
    examplesByKey[buildLearningProgressKey('ru', category.id)] = category.examples
    examplesByKey[buildLearningProgressKey('en', category.id)] = category.examplesEn
    return examplesByKey
  },
  {},
)

function getCategoryExamples(
  language: UiLanguage,
  category: LearnCategory,
): readonly string[] {
  return language === 'ru' ? category.examples : category.examplesEn
}

function commitProgressState(
  update: (previous: LearningProgressState) => LearningProgressState,
  setProgress: Dispatch<SetStateAction<LearningProgressState>>,
): void {
  setProgress((previous) => {
    const next = update(previous)
    writeLearningProgressState(next)
    return next
  })
}

export function useLearningProgress() {
  const [progress, setProgress] = useState<LearningProgressState>(() =>
    readLearningProgressState(allowedExamplesByKey),
  )

  const getProgress = useCallback(
    (language: UiLanguage, category: LearnCategory): CategoryProgress =>
      getCategoryProgress(
        progress,
        buildLearningProgressKey(language, category.id),
        getCategoryExamples(language, category),
      ),
    [progress],
  )

  const toggleExample = useCallback(
    (language: UiLanguage, category: LearnCategory, example: string) => {
      commitProgressState(
        (previous) =>
          toggleLearningProgressExample(
            previous,
            buildLearningProgressKey(language, category.id),
            example,
            getCategoryExamples(language, category),
          ),
        setProgress,
      )
    },
    [],
  )

  const resetCategory = useCallback(
    (language: UiLanguage, category: LearnCategory) => {
      commitProgressState(
        (previous) =>
          resetLearningCategoryProgress(
            previous,
            buildLearningProgressKey(language, category.id),
          ),
        setProgress,
      )
    },
    [],
  )

  return { getProgress, toggleExample, resetCategory }
}
