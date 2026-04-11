import { Link } from 'react-router-dom'

interface ErrorMessageProps {
  message: string
  title?: string
}

export function ErrorMessage({
  message,
  title = 'Сервис временно недоступен',
}: ErrorMessageProps) {
  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/70 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-red-900">{title}</h2>
      <p className="mt-2 text-sm text-red-800">{message}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          Обновить страницу
        </button>
        <Link
          to="/learn"
          className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-900 transition hover:bg-red-100"
        >
          Перейти в раздел «Изучение»
        </Link>
      </div>
    </section>
  )
}
