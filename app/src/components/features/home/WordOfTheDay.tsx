import { Link } from 'react-router-dom'
import type { UiLanguage } from '../../../i18n/translations'

const wordsByLanguage: Record<UiLanguage, string[]> = {
  ru: ['ирония', 'ибо', 'типа', 'контекст', 'лексика'],
  en: ['irony', 'therefore', 'like', 'context', 'vocabulary'],
}

interface WordOfTheDayProps {
  language: UiLanguage
  title: string
  description: string
  actionLabel: string
}

export function WordOfTheDay({
  language,
  title,
  description,
  actionLabel,
}: WordOfTheDayProps) {
  const words = wordsByLanguage[language]
  const dayIndex = new Date().getDate() % words.length
  const word = words[dayIndex]

  return (
    <section className="surface-hover rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-cyan-50 to-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
        {title}
      </p>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{word}</h2>
      <p className="mt-2 text-slate-700">{description}</p>
      <Link
        to={`/word/${encodeURIComponent(word)}`}
        className="mt-4 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
      >
        {actionLabel}
      </Link>
    </section>
  )
}
