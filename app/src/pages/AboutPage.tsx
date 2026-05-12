import { useI18n } from '../i18n/i18nContext'

export function AboutPage() {
  const { t } = useI18n()

  return (
    <div className="page-enter space-y-6">
      <section className="surface-hover rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t.about.title}
        </h1>
        <p className="mt-4 max-w-3xl text-slate-600">{t.about.intro}</p>
      </section>

      <section className="surface-hover rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {t.about.solvesTitle}
        </h2>
        <ul className="mt-4 space-y-2 text-slate-700">
          {t.about.solves.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="surface-hover rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {t.about.audienceTitle}
        </h2>
        <p className="mt-4 text-slate-600">{t.about.audience}</p>
      </section>
    </div>
  )
}
