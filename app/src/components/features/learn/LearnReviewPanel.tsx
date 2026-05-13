import { Link } from 'react-router-dom'
import type { UiLanguage } from '../../../i18n/translations'

interface LearnReviewPanelProps {
  favorites: string[]
  recentSearches: string[]
  language: UiLanguage
}

function ReviewList({
  title,
  emptyMessage,
  words,
}: {
  title: string
  emptyMessage: string
  words: string[]
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {words.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {words.map((word) => (
            <Link
              key={word}
              to={`/word/${encodeURIComponent(word)}`}
              className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              {word}
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
          {emptyMessage}
        </p>
      )}
    </article>
  )
}

export function LearnReviewPanel({
  favorites,
  recentSearches,
  language,
}: LearnReviewPanelProps) {
  const isRussian = language === 'ru'

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
        {isRussian ? 'Повторение' : 'Review'}
      </h2>
      <p className="mt-2 text-slate-600">
        {isRussian
          ? 'Используй личные списки, чтобы быстро вернуться к словам, которые уже искал или отметил.'
          : 'Use personal lists to return quickly to words you searched for or marked.'}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ReviewList
          title={isRussian ? 'Тренировка по избранным словам' : 'Practice favorite words'}
          emptyMessage={
            isRussian
              ? 'Добавь слова в избранное из карточки, и они появятся здесь.'
              : 'Mark words as favorites from a word card, and they will appear here.'
          }
          words={favorites}
        />
        <ReviewList
          title={isRussian ? 'Повторение слов из истории' : 'Review recent searches'}
          emptyMessage={
            isRussian
              ? 'История пока пуста. Найди несколько слов, чтобы повторить их позже.'
              : 'History is empty. Search for a few words to review them later.'
          }
          words={recentSearches}
        />
      </div>
    </section>
  )
}
