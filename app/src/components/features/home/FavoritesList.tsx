import { Link } from 'react-router-dom'

export function FavoritesList({ favorites }: { favorites: string[] }) {
  return (
    <section className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Избранные слова</h2>
      {favorites.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {favorites.map((word) => (
            <Link
              key={word}
              to={`/word/${encodeURIComponent(word)}`}
              className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              {word}
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          Здесь будут слова, которые ты отметил для повторения.
        </div>
      )}
    </section>
  )
}
