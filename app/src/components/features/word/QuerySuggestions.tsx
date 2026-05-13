import { Link } from 'react-router-dom'
import type { WordLanguage } from '../../../types/word'

interface QuerySuggestionsProps {
  suggestions: string[]
  language?: WordLanguage
}

export function QuerySuggestions({
  suggestions,
  language = 'ru',
}: QuerySuggestionsProps) {
  if (suggestions.length === 0) {
    return null
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">
        {language === 'ru' ? 'Похожие запросы' : 'Similar queries'}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Link
            key={suggestion}
            to={`/word/${encodeURIComponent(suggestion)}`}
            className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
          >
            {suggestion}
          </Link>
        ))}
      </div>
    </section>
  )
}
