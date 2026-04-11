export function AboutPage() {
  return (
    <div className="page-enter space-y-6">
      <section className="surface-hover rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">О проекте</h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          Слово+ — учебный веб-сервис по русскому языку. Он сочетает поиск по
          словарю, локальную базу стилистических подсказок и инструменты
          практики, чтобы помогать пользователю писать точнее и грамотнее.
        </p>
      </section>

      <section className="surface-hover rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Что решает сервис</h2>
        <ul className="mt-4 space-y-2 text-slate-700">
          <li>Показывает определение слова, примеры и часть речи.</li>
          <li>Подсказывает стилистическую уместность и типичные ошибки.</li>
          <li>Даёт связанные слова для расширения словарного запаса.</li>
          <li>Сохраняет историю и избранные слова для повторения.</li>
          <li>Предлагает мини-квиз для закрепления материала.</li>
        </ul>
      </section>

      <section className="surface-hover rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Кому подходит</h2>
        <p className="mt-4 text-slate-600">
          Школьникам, студентам, преподавателям и всем, кто хочет улучшить
          письменную и устную речь, научиться точнее выбирать слова и
          ориентироваться в стилях русского языка.
        </p>
      </section>
    </div>
  )
}
