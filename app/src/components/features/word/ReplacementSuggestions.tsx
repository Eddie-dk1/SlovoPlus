import type { ReplacementSuggestion } from '../../../data/replacementSuggestions'
import type { WordLanguage } from '../../../types/word'

interface ReplacementSuggestionsProps {
  suggestions: ReplacementSuggestion[]
  language?: WordLanguage
}

export function ReplacementSuggestions({
  suggestions,
  language = 'ru',
}: ReplacementSuggestionsProps) {
  if (suggestions.length === 0) {
    return null
  }

  return (
    <section className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        {language === 'ru' ? 'Лучше заменить на...' : 'Clearer replacements'}
      </h2>
      <div className="mt-4 space-y-4">
        {suggestions.map((suggestion) => (
          <article
            key={suggestion.phrase}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-sm font-semibold text-slate-900">
              {suggestion.phrase}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestion.replacements.map((replacement) => (
                <span
                  key={replacement}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                >
                  {replacement}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-600">{suggestion.note}</p>
            <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
              <p className="rounded-xl bg-white p-3 text-slate-600">
                <span className="font-medium text-slate-500">
                  {language === 'ru' ? 'Было: ' : 'Before: '}
                </span>
                {suggestion.before}
              </p>
              <p className="rounded-xl bg-white p-3 text-slate-800">
                <span className="font-medium text-slate-500">
                  {language === 'ru' ? 'Стало: ' : 'After: '}
                </span>
                {suggestion.after}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
