import { useMemo, useState } from 'react'
import type { WordLanguage, WordStyle } from '../../../types/word'
import { analyzeWordUsageInSentence } from '../../../utils/contextAnalysis'

interface ContextAnalyzerProps {
  word: string
  styles: WordStyle[]
  language?: WordLanguage
}

const registerLabels = {
  neutral: 'нейтральный',
  informal: 'разговорный',
  formal: 'формальный',
  mixed: 'смешанный',
} as const

const englishRegisterLabels = {
  neutral: 'neutral',
  informal: 'informal',
  formal: 'formal',
  mixed: 'mixed',
} as const

export function ContextAnalyzer({ word, styles, language = 'ru' }: ContextAnalyzerProps) {
  const [sentence, setSentence] = useState('')
  const isRussian = language === 'ru'
  const result = useMemo(
    () => analyzeWordUsageInSentence(word, styles, sentence, language),
    [language, sentence, styles, word],
  )
  const labels = isRussian ? registerLabels : englishRegisterLabels

  return (
    <section className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        {isRussian ? 'Анализ в предложении' : 'Sentence check'}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        {isRussian
          ? `Вставь предложение со словом «${word}». Сервис даст осторожную предварительную оценку уместности.`
          : `Enter a sentence with "${word}". The service will give a cautious usage check.`}
      </p>

      <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="context-input">
        {isRussian ? 'Предложение' : 'Sentence'}
      </label>
      <textarea
        id="context-input"
        value={sentence}
        onChange={(event) => setSentence(event.target.value)}
        rows={4}
        placeholder={
          isRussian
            ? `Например: В статье это слово «${word}» употреблено корректно.`
            : `For example: The word "${word}" is used correctly here.`
        }
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-blue-500"
      />

      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
        <p>
          {isRussian ? 'Контекст' : 'Context'}: <strong>{labels[result.register]}</strong>
        </p>
        <p className="mt-2">{result.summary}</p>
        {result.reasons.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs text-slate-500">
            {result.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
