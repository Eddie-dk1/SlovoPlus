import { useState } from 'react'
import type { LearningExercise } from '../../../data/learningExercises'
import type { UiLanguage } from '../../../i18n/translations'

interface CategoryExercisesProps {
  exercises: LearningExercise[]
  language: UiLanguage
}

const kindLabelMap: Record<
  LearningExercise['kind'],
  { ru: string; en: string }
> = {
  'choose-style': {
    ru: 'Выбери стиль',
    en: 'Choose style',
  },
  'find-error': {
    ru: 'Найди ошибку',
    en: 'Find issue',
  },
  'replace-bureaucratic': {
    ru: 'Замени канцеляризм',
    en: 'Replace heavy wording',
  },
}

export function CategoryExercises({
  exercises,
  language,
}: CategoryExercisesProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const isRussian = language === 'ru'

  if (exercises.length === 0) {
    return null
  }

  return (
    <section className="surface-hover rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
      <h2 className="text-xl font-semibold text-slate-900">
        {isRussian ? 'Упражнения' : 'Exercises'}
      </h2>
      <p className="mt-2 text-slate-600">
        {isRussian
          ? 'Проверь стиль, найди неудачную формулировку и выбери более ясную замену.'
          : 'Check style, find weak wording, and choose a clearer replacement.'}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {exercises.map((exercise) => {
          const selectedIndex = answers[exercise.id]
          const isAnswered = selectedIndex !== undefined
          const isCorrect = selectedIndex === exercise.correctIndex
          const options = isRussian ? exercise.options : exercise.optionsEn

          return (
            <article
              key={exercise.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
                {kindLabelMap[exercise.kind][language]}
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-900">
                {isRussian ? exercise.title : exercise.titleEn}
              </h3>
              <p className="mt-2 text-sm text-slate-700">
                {isRussian ? exercise.prompt : exercise.promptEn}
              </p>

              <div className="mt-4 space-y-2">
                {options.map((option, index) => {
                  const isSelected = selectedIndex === index
                  const showCorrect = isAnswered && index === exercise.correctIndex
                  const showWrong = isAnswered && isSelected && !isCorrect

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setAnswers((previous) => ({
                          ...previous,
                          [exercise.id]: index,
                        }))
                      }
                      className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                        showCorrect
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                          : showWrong
                            ? 'border-rose-300 bg-rose-50 text-rose-900'
                            : isSelected
                              ? 'border-blue-300 bg-blue-50 text-blue-900'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>

              {isAnswered ? (
                <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700">
                  {isCorrect
                    ? isRussian
                      ? 'Верно. '
                      : 'Correct. '
                    : isRussian
                      ? 'Нужно уточнить. '
                      : 'Needs revision. '}
                  {isRussian ? exercise.explanation : exercise.explanationEn}
                </p>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
