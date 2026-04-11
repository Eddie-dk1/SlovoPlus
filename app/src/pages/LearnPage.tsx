import { CategoriesGrid } from '../components/features/learn/CategoriesGrid'
import { LearningCollections } from '../components/features/learn/LearningCollections'

export function LearnPage() {
  return (
    <div className="page-enter space-y-6">
      <section className="surface-hover rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
          Практика и категории
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          Изучение лексики
        </h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          Раздел помогает быстро ориентироваться в стилях речи и типичных
          речевых ошибках. Выбери категорию и используй примеры для тренировки
          формулировок.
        </p>
        <div className="mt-5 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
          <p className="rounded-xl bg-slate-50 p-3">1. Выбери категорию сложности</p>
          <p className="rounded-xl bg-slate-50 p-3">2. Открой слово из примеров</p>
          <p className="rounded-xl bg-slate-50 p-3">3. Проверь стиль и контекст</p>
        </div>
      </section>

      <CategoriesGrid />
      <LearningCollections />
    </div>
  )
}
