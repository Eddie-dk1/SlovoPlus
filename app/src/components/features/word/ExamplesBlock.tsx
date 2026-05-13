import { useState } from 'react'
import type { WordLanguage } from '../../../types/word'

export function ExamplesBlock({
  examples,
  language = 'ru',
}: {
  examples: string[]
  language?: WordLanguage
}) {
  const [copiedExample, setCopiedExample] = useState<string | null>(null)

  if (examples.length === 0) {
    return null
  }

  const copyExample = async (example: string) => {
    if (!navigator.clipboard) {
      return
    }

    await navigator.clipboard.writeText(example)
    setCopiedExample(example)
    window.setTimeout(() => setCopiedExample(null), 1600)
  }

  return (
    <section className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        {language === 'ru' ? 'Примеры' : 'Examples'}
      </h2>
      <ul className="mt-3 space-y-2 text-slate-700">
        {examples.map((example) => (
          <li
            key={example}
            className="flex flex-col gap-3 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-start sm:justify-between"
          >
            <span>{example}</span>
            <button
              type="button"
              onClick={() => {
                void copyExample(example)
              }}
              className="inline-flex w-fit rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {copiedExample === example
                ? language === 'ru'
                  ? 'Скопировано'
                  : 'Copied'
                : language === 'ru'
                  ? 'Копировать'
                  : 'Copy'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
