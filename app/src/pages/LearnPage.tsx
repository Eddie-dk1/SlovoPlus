import { CategoriesGrid } from '../components/features/learn/CategoriesGrid'
import { LearningCollections } from '../components/features/learn/LearningCollections'
import { useLearningProgress } from '../hooks/useLearningProgress'
import { useI18n } from '../i18n/i18nContext'

export function LearnPage() {
  const { language, t } = useI18n()
  const { getProgress } = useLearningProgress()

  return (
    <div className="page-enter space-y-6">
      <section className="surface-hover rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
          {t.learn.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          {t.learn.title}
        </h1>
        <p className="mt-4 max-w-3xl text-slate-600">{t.learn.description}</p>
        <div className="mt-5 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
          {t.learn.steps.map((step) => (
            <p key={step} className="rounded-xl bg-slate-50 p-3">
              {step}
            </p>
          ))}
        </div>
      </section>

      <CategoriesGrid
        language={language}
        title={t.learn.categoriesTitle}
        countLabel={t.learn.categoriesCount}
        labels={t.learn}
        getProgress={(category) => getProgress(language, category)}
      />
      <LearningCollections
        language={language}
        title={t.learn.collectionsTitle}
        description={t.learn.collectionsDescription}
        wordsLabel={t.learn.collectionWords}
      />
    </div>
  )
}
