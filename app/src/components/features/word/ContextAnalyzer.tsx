import { useMemo, useState } from 'react'
import type { WordStyle } from '../../../types/word'
import { analyzeWordUsageInSentence } from '../../../utils/contextAnalysis'

interface ContextAnalyzerProps {
  word: string
  styles: WordStyle[]
}

const registerLabels = {
  neutral: 'нейтральный',
  informal: 'разговорный',
  formal: 'формальный',
  mixed: 'смешанный',
} as const

export function ContextAnalyzer({ word, styles }: ContextAnalyzerProps) {
  const [sentence, setSentence] = useState('')
  const result = useMemo(
    () => analyzeWordUsageInSentence(word, styles, sentence),
    [sentence, styles, word],
  )

  return (
    <section className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Анализ в предложении</h2>
      <p className="mt-2 text-sm text-slate-600">
        Вставь предложение со словом «{word}». Сервис даст осторожную предварительную
        оценку уместности.
      </p>

      <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="context-input">
        Предложение
      </label>
      <textarea
        id="context-input"
        value={sentence}
        onChange={(event) => setSentence(event.target.value)}
        rows={4}
        placeholder={`Например: В статье это слово «${word}» употреблено корректно.`}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-blue-500"
      />

      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
        <p>
          Контекст: <strong>{registerLabels[result.register]}</strong>
        </p>
        <p className="mt-2">{result.summary}</p>
      </div>
    </section>
  )
}
