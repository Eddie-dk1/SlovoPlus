import { Link, Navigate, useParams } from 'react-router-dom'
import { categories } from '../data/categories'

export function LearnCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const category = categories.find((item) => item.id === categoryId)

  if (!category) {
    return <Navigate to="/learn" replace />
  }

  return (
    <div className="page-enter space-y-6">
      <section className="surface-hover rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <Link
          to="/learn"
          className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          К категориям
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {category.title}
        </h1>
        <p className="mt-3 text-slate-600">{category.description}</p>
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-slate-700">
          {category.whyItMatters}
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Совет: открой 2–3 примера подряд и сравни стилистику в карточках слов.
        </p>
      </section>

      <section className="surface-hover rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <h2 className="text-xl font-semibold text-slate-900">Примеры для практики</h2>
        <p className="mt-2 text-slate-600">
          Нажми на пример, чтобы открыть карточку слова и посмотреть стиль
          употребления.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {category.examples.map((example) => (
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
