import { useEffect, useId, useMemo, useState } from 'react'
import type { WordLanguage } from '../../types/word'
import { detectWordLanguage } from '../../utils/language'

interface SearchBarProps {
  placeholder?: string
  initialValue?: string
  suggestions?: string[]
  language?: WordLanguage
  labels?: {
    ariaLabel: string
    clear: string
    submit: string
    submitAria: string
    hint: string
    detected: string
    detectedRu: string
    detectedEn: string
    detectedUnknown: string
  }
  onSearch: (value: string) => void
}

const defaultLabels: NonNullable<SearchBarProps['labels']> = {
  ariaLabel: 'Поиск слова',
  clear: 'Очистить ввод',
  submit: 'Найти',
  submitAria: 'Запустить поиск',
  hint: 'Поддерживаются отдельные слова и короткие выражения.',
  detected: 'Распознан язык',
  detectedRu: 'русский',
  detectedEn: 'английский',
  detectedUnknown: 'не определен',
}

export function SearchBar({
  placeholder = 'Введите слово',
  initialValue = '',
  suggestions = [],
  language = 'ru',
  labels = defaultLabels,
  onSearch,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue)
  const datalistId = useId()

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const filteredSuggestions = useMemo(() => {
    const normalized = value
      .trim()
      .toLocaleLowerCase(language === 'ru' ? 'ru-RU' : 'en-US')
    const source = suggestions.slice(0, 30)

    if (!normalized) {
      return source.slice(0, 8)
    }

    return source
      .filter((item) =>
        item
          .toLocaleLowerCase(language === 'ru' ? 'ru-RU' : 'en-US')
          .includes(normalized),
      )
      .slice(0, 8)
  }, [language, suggestions, value])

  const detectedLanguage = detectWordLanguage(value)
  const detectedLanguageLabel =
    detectedLanguage === 'ru'
      ? labels.detectedRu
      : detectedLanguage === 'en'
        ? labels.detectedEn
        : labels.detectedUnknown

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch(value)
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            aria-label={labels.ariaLabel}
            list={datalistId}
            className="h-12 w-full rounded-xl border border-slate-300 px-4 pr-10 text-base outline-none transition focus:border-blue-500"
          />
          {value.trim() ? (
            <button
              type="button"
              onClick={() => setValue('')}
              aria-label={labels.clear}
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              ×
            </button>
          ) : null}
        </div>
        <datalist id={datalistId}>
          {filteredSuggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
        <button
          type="submit"
          aria-label={labels.submitAria}
          className="h-12 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {labels.submit}
        </button>
      </form>
      <p className="text-xs text-slate-500">
        {labels.hint}{' '}
        <span className="font-medium text-slate-600">
          {labels.detected}: {detectedLanguageLabel}.
        </span>
      </p>
    </div>
  )
}
