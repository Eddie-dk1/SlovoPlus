interface UsageTipsProps {
  usageTips: string[]
  mistakes: string[]
}

export function UsageTips({ usageTips, mistakes }: UsageTipsProps) {
  if (usageTips.length === 0 && mistakes.length === 0) {
    return null
  }

  return (
    <section className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Уместность и ошибки</h2>

      {usageTips.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500">Рекомендации</p>
          <ul className="mt-2 space-y-2 text-slate-700">
            {usageTips.map((item) => (
              <li key={item} className="rounded-lg bg-slate-50 p-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {mistakes.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500">Типичные ошибки</p>
          <ul className="mt-2 space-y-2 text-slate-700">
            {mistakes.map((item) => (
              <li key={item} className="rounded-lg bg-amber-50 p-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
