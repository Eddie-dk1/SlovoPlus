import { Link, Navigate, useParams } from 'react-router-dom'
import { categories } from '../data/categories'
import { useI18n } from '../i18n/i18nContext'

export function LearnCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { language, t } = useI18n()
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
        <p className="mt-3 text-sm text-slate-500">{t.learn.categoryTip}</p>
      </section>

      <section className="surface-hover rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <h2 className="text-xl font-semibold text-slate-900">
          {t.learn.practiceExamples}
        </h2>
        <p className="mt-2 text-slate-600">{t.learn.practiceDescription}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {examples.map((example) => (
            <Link
              key={example}
              to={`/word/${encodeURIComponent(example.split('/')[0].trim())}`}
              className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              {example}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
