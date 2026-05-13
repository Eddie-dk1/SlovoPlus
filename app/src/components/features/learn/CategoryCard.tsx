import type { LearnCategory } from '../../../data/categories'
import type { UiLanguage } from '../../../i18n/translations'
import type { CategoryProgress } from '../../../utils/learningProgress'
import { Link } from 'react-router-dom'

interface CategoryCardProps {
  category: LearnCategory
  language: UiLanguage
  labels: {
    categoryLabel: string
    openMaterials: string
    progressLabel: string
    completedLabel: string
  }
  progress: CategoryProgress
}

export function CategoryCard({
  category,
  language,
  labels,
  progress,
}: CategoryCardProps) {
  const title = language === 'ru' ? category.title : category.titleEn
  const description =
    language === 'ru' ? category.description : category.descriptionEn
  const whyItMatters =
    language === 'ru' ? category.whyItMatters : category.whyItMattersEn
  const examples = language === 'ru' ? category.examples : category.examplesEn

  return (
    <article className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
        {labels.categoryLabel}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>

      <p className="mt-4 text-sm text-slate-700">{whyItMatters}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {examples.map((example) => (
          <span
            key={example}
            className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
          >
            {example}
          </span>
        ))}
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>{labels.progressLabel}</span>
          <span>
            {progress.completedCount}/{progress.totalCount}{' '}
            {progress.isCompleted ? labels.completedLabel : ''}
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
          aria-label={`${labels.progressLabel}: ${progress.completedCount}/${progress.totalCount}`}
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      <Link
        to={`/learn/${category.id}`}
        className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        {labels.openMaterials}
      </Link>
    </article>
  )
}
