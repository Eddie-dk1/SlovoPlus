import { useI18n } from '../../i18n/i18nContext'

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-6 text-sm text-slate-500">
        {t.footer} · {new Date().getFullYear()}
      </div>
    </footer>
  )
}
