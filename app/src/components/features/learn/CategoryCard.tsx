import type { LearnCategory } from '../../../data/categories'
import { Link } from 'react-router-dom'

export function CategoryCard({ category }: { category: LearnCategory }) {
  return (
    <article className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
        Категория
      </p>
      <h3 className="mt-2 text-xl font-semibold text-slate-900">{category.title}</h3>
      <p className="mt-2 text-slate-600">{category.description}</p>

      <p className="mt-4 text-sm text-slate-700">{category.whyItMatters}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {category.examples.map((example) => (
          <span
            key={example}
            className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
          >
            {example}
          </span>
        ))}
      </div>

      <Link
        to={`/learn/${category.id}`}
        className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Открыть материалы
      </Link>
    </article>
  )
}
