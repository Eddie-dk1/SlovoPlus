import { Link } from 'react-router-dom'
import { learningCollections } from '../../../data/learningCollections'

export function LearningCollections() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
        Готовые подборки
      </h2>
      <p className="mt-2 text-slate-600">
        Используй наборы для практики: открой слово и проверь его стиль, примеры
        и уместность.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {learningCollections.map((collection) => (
          <article
            key={collection.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <h3 className="text-base font-semibold text-slate-900">
              {collection.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{collection.focus}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
              Слова для тренировки
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {collection.words.map((word) => (
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
        ))}
      </div>
    </section>
  )
}
