import { Link } from 'react-router-dom'

export function RecentSearches({ searches }: { searches: string[] }) {
  return (
    <section className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Последние запросы</h2>
      {searches.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {searches.map((search) => (
            <Link
              key={search}
              to={`/word/${encodeURIComponent(search)}`}
              className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              {search}
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          История пока пуста. Найди первое слово и вернись сюда для повторения.
        </div>
      )}
    </section>
  )
}
