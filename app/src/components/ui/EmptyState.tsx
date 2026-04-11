import { Link } from 'react-router-dom'

interface EmptyStateProps {
  title: string
  description: string
  primaryLink?: { label: string; to: string }
  secondaryLink?: { label: string; to: string }
}

export function EmptyState({
  title,
  description,
  primaryLink,
  secondaryLink,
}: EmptyStateProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-slate-600">{description}</p>
      {primaryLink || secondaryLink ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {primaryLink ? (
            <Link
              to={primaryLink.to}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {primaryLink.label}
            </Link>
          ) : null}
          {secondaryLink ? (
            <Link
              to={secondaryLink.to}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {secondaryLink.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
