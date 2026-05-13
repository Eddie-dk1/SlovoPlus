import type { UiLanguage } from '../i18n/translations'

const STORAGE_KEY = 'slovo_plus_learning_progress'

export type LearningProgressState = Record<string, string[]>

export interface CategoryProgress {
  completedExamples: string[]
  completedCount: number
  totalCount: number
  percent: number
  isCompleted: boolean
}

export function buildLearningProgressKey(
  language: UiLanguage,
  categoryId: string,
): string {
  return `${language}:${categoryId}`
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function sanitizeCategoryProgress(
  value: unknown,
  allowedExamples: readonly string[],
): string[] {
  if (!isStringArray(value)) {
    return []
  }

  return value
    .map((item) => item.trim())
    .filter((item) => allowedExamples.includes(item))
    .filter((item, index, array) => array.indexOf(item) === index)
}

export function sanitizeLearningProgressState(
  value: unknown,
  allowedExamplesByKey: Record<string, readonly string[]>,
): LearningProgressState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  return Object.entries(allowedExamplesByKey).reduce<LearningProgressState>(
    (state, [key, allowedExamples]) => {
      const completedExamples = sanitizeCategoryProgress(
        (value as Record<string, unknown>)[key],
        allowedExamples,
      )

      if (completedExamples.length > 0) {
        state[key] = completedExamples
      }

      return state
    },
    {},
  )
}

export function readLearningProgressState(
  allowedExamplesByKey: Record<string, readonly string[]>,
): LearningProgressState {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    if (!storedValue) {
      return {}
    }

    return sanitizeLearningProgressState(
      JSON.parse(storedValue) as unknown,
      allowedExamplesByKey,
    )
  } catch {
    return {}
  }
}

export function writeLearningProgressState(state: LearningProgressState): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Игнорируем ошибки localStorage (например, private mode/quota exceeded).
  }
}

export function getCategoryProgress(
  state: LearningProgressState,
  categoryKey: string,
  examples: readonly string[],
): CategoryProgress {
  const completedExamples = sanitizeCategoryProgress(state[categoryKey], examples)
  const totalCount = examples.length
  const completedCount = completedExamples.length

  return {
    completedExamples,
    completedCount,
    totalCount,
    percent: totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
    isCompleted: totalCount > 0 && completedCount === totalCount,
  }
}

export function toggleLearningProgressExample(
  state: LearningProgressState,
  categoryKey: string,
  example: string,
  allowedExamples: readonly string[],
): LearningProgressState {
  if (!allowedExamples.includes(example)) {
    return state
  }

  const currentProgress = getCategoryProgress(state, categoryKey, allowedExamples)
  const completedExamples = currentProgress.completedExamples.includes(example)
    ? currentProgress.completedExamples.filter((item) => item !== example)
    : [...currentProgress.completedExamples, example]

  if (completedExamples.length === 0) {
    const next = { ...state }
    delete next[categoryKey]
    return next
  }

  return {
    ...state,
    [categoryKey]: completedExamples,
  }
}

export function resetLearningCategoryProgress(
  state: LearningProgressState,
  categoryKey: string,
): LearningProgressState {
  const next = { ...state }
  delete next[categoryKey]
  return next
}
