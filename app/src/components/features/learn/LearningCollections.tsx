import { Link } from 'react-router-dom'
import { learningCollections } from '../../../data/learningCollections'
import type { UiLanguage } from '../../../i18n/translations'

interface LearningCollectionsProps {
  language: UiLanguage
  title: string
  description: string
  wordsLabel: string
}

export function LearningCollections({
  language,
  title,
  description,
  wordsLabel,
}: LearningCollectionsProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-2 text-slate-600">{description}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {learningCollections.map((collection) => {
          const collectionTitle =
            language === 'ru' ? collection.title : collection.titleEn
          const focus = language === 'ru' ? collection.focus : collection.focusEn
          const words = language === 'ru' ? collection.words : collection.wordsEn

          return (
            <article
              key={collection.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate-900">
                {collectionTitle}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{focus}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                {wordsLabel}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {words.map((word) => (
                  <Link
                    key={word}
                    to={`/word/${encodeURIComponent(word)}`}
                    className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    {word}
                  </Link>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
