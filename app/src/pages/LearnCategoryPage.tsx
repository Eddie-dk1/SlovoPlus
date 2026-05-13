import { Link, Navigate, useParams } from 'react-router-dom'
import { CategoryExercises } from '../components/features/learn/CategoryExercises'
import { categories } from '../data/categories'
import { getLearningExercisesByCategory } from '../data/learningExercises'
import { useLearningProgress } from '../hooks/useLearningProgress'
import { useI18n } from '../i18n/i18nContext'

export function LearnCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { language, t } = useI18n()
  const { getProgress, resetCategory, toggleExample } = useLearningProgress()
  const category = categories.find((item) => item.id === categoryId)

  if (!category) {
    return <Navigate to="/learn" replace />
  }

  const title = language === 'ru' ? category.title : category.titleEn
  const description =
    language === 'ru' ? category.description : category.descriptionEn
  const whyItMatters =
    language === 'ru' ? category.whyItMatters : category.whyItMattersEn
  const examples = language === 'ru' ? category.examples : category.examplesEn
  const progress = getProgress(language, category)
  const exercises = getLearningExercisesByCategory(category.id)

  return (
    <div className="page-enter space-y-6">
      <section className="surface-hover rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <Link
          to="/learn"
          className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          {t.learn.backToCategories}
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-slate-600">{description}</p>
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-slate-700">
          {whyItMatters}
        </p>
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium text-slate-600">
            <span>{t.learn.progressLabel}</span>
            <span>
              {progress.completedCount}/{progress.totalCount}{' '}
              {progress.isCompleted ? t.learn.completedLabel : t.learn.inProgressLabel}
            </span>
          </div>
          <div
            className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"
            aria-label={`${t.learn.progressLabel}: ${progress.completedCount}/${progress.totalCount}`}
          >
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      </section>

      <section className="surface-hover rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <h2 className="text-xl font-semibold text-slate-900">
          {t.learn.practiceExamples}
        </h2>
        <p className="mt-2 text-slate-600">{t.learn.practiceDescription}</p>

        <div className="mt-5 space-y-3">
          {examples.map((example) => (
            <div
              key={example}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <label className="flex min-w-0 items-center gap-3 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={progress.completedExamples.includes(example)}
                  onChange={() => toggleExample(language, category, example)}
                  className="h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600"
                />
                <span>{example}</span>
              </label>
              <Link
                to={`/word/${encodeURIComponent(example.split('/')[0].trim())}`}
                className="inline-flex w-fit rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {t.learn.openWordCard}
              </Link>
            </div>
          ))}
        </div>

        {progress.isCompleted ? (
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <h3 className="text-base font-semibold text-blue-950">
              {t.learn.categoryResultTitle}
            </h3>
            <p className="mt-2 text-sm text-blue-900">
              {t.learn.categoryResultDescription}
            </p>
            <button
              type="button"
              onClick={() => resetCategory(language, category)}
              className="mt-4 inline-flex rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              {t.learn.resetCategoryProgress}
            </button>
          </div>
        ) : null}
      </section>

      <CategoryExercises exercises={exercises} language={language} />
    </div>
  )
}
