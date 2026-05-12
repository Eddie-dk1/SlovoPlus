import { NavLink } from 'react-router-dom'
import { useI18n } from '../../i18n/i18nContext'
import { uiLanguages } from '../../i18n/translations'

const navClassName = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
  ].join(' ')

export function Header() {
  const { language, setLanguage, t } = useI18n()

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <NavLink
          to="/"
          className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl"
        >
          <span className="text-slate-900">Слово</span>
          <span className="text-blue-600">+</span>
        </NavLink>
        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/" end className={navClassName}>
            {t.header.home}
          </NavLink>
          <NavLink to="/learn" className={navClassName}>
            {t.header.learn}
          </NavLink>
          <NavLink to="/about" className={navClassName}>
            {t.header.about}
          </NavLink>
          <div
            className="ml-0 inline-flex rounded-full border border-slate-300 bg-slate-50 p-1 sm:ml-2"
            aria-label={t.header.languageToggle}
          >
            {uiLanguages.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLanguage(item)}
                className={[
                  'rounded-full px-3 py-1 text-xs font-semibold uppercase transition',
                  item === language
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-white',
                ].join(' ')}
                aria-pressed={item === language}
              >
                {item}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}
