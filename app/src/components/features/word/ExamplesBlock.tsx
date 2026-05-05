import type { WordLanguage } from '../../../types/word'

export function ExamplesBlock({
  examples,
  language = 'ru',
}: {
  examples: string[]
  language?: WordLanguage
}) {
  if (examples.length === 0) {
    return null
  }

  return (
    <section className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        {language === 'ru' ? 'Примеры' : 'Examples'}
      </h2>
      <ul className="mt-3 space-y-2 text-slate-700">
        {examples.map((example) => (
          <li key={example} className="rounded-lg bg-slate-50 p-3">
            {example}
          </li>
        ))}
      </ul>
    </section>
  )
}
