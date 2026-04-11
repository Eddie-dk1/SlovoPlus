import { useEffect, useId, useMemo, useState } from 'react'

interface SearchBarProps {
  placeholder?: string
  initialValue?: string
  suggestions?: string[]
  onSearch: (value: string) => void
}

export function SearchBar({
  placeholder = 'Введите слово',
  initialValue = '',
  suggestions = [],
  onSearch,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue)
  const datalistId = useId()

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const filteredSuggestions = useMemo(() => {
    const normalized = value.trim().toLocaleLowerCase('ru-RU')
    const source = suggestions.slice(0, 30)

    if (!normalized) {
      return source.slice(0, 8)
    }

    return source
      .filter((item) => item.toLocaleLowerCase('ru-RU').includes(normalized))
      .slice(0, 8)
  }, [suggestions, value])

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
            aria-label="Поиск слова"
            list={datalistId}
            className="h-12 w-full rounded-xl border border-slate-300 px-4 pr-10 text-base outline-none transition focus:border-blue-500"
          />
          {value.trim() ? (
            <button
              type="button"
              onClick={() => setValue('')}
              aria-label="Очистить ввод"
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
          aria-label="Запустить поиск"
          className="h-12 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Найти
        </button>
      </form>
      <p className="text-xs text-slate-500">
        Поддерживаются отдельные слова и короткие выражения.
      </p>
    </div>
  )
}
