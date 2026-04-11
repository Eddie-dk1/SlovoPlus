import { Link } from 'react-router-dom'

export function RelatedWords({ relatedWords }: { relatedWords: string[] }) {
  if (relatedWords.length === 0) {
    return null
  }

  return (
    <section className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Похожие слова</h2>
      <p className="mt-1 text-sm text-slate-500">
        Нажми на слово, чтобы сразу открыть его карточку.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {relatedWords.map((word) => (
          <Link
            key={word}
            to={`/word/${encodeURIComponent(word)}`}
            className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
          >
            {word}
          </Link>
        ))}
      </div>
    </section>
  )
}
