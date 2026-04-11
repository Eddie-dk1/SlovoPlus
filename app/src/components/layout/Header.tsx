import { NavLink } from 'react-router-dom'

const navClassName = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
  ].join(' ')

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <NavLink
          to="/"
          className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl"
        >
          <span className="text-slate-900">Слово</span>
          <span className="text-blue-600">+</span>
        </NavLink>
        <nav className="flex items-center gap-2">
          <NavLink to="/" end className={navClassName}>
            Главная
          </NavLink>
          <NavLink to="/learn" className={navClassName}>
            Изучение
          </NavLink>
          <NavLink to="/about" className={navClassName}>
            О проекте
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
