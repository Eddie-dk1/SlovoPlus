import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DefinitionBlock } from '../components/features/word/DefinitionBlock'
import { ExamplesBlock } from '../components/features/word/ExamplesBlock'
import { ContextAnalyzer } from '../components/features/word/ContextAnalyzer'
import { MiniQuiz } from '../components/features/word/MiniQuiz'
import { RelatedWords } from '../components/features/word/RelatedWords'
import { UsageTips } from '../components/features/word/UsageTips'
import { WordCard } from '../components/features/word/WordCard'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Loader } from '../components/ui/Loader'
import { SearchBar } from '../components/ui/SearchBar'
import { searchSuggestions } from '../data/searchSuggestions'
import { useFavorites } from '../hooks/useFavorites'
import { useRecentSearches } from '../hooks/useRecentSearches'
import { useWordSearch } from '../hooks/useWordSearch'

function WordLookupResult({
  query,
  isFavorite,
  onToggleFavorite,
}: {
  query: string
  isFavorite: (word: string) => boolean
  onToggleFavorite: (word: string) => void
}) {
  const { isLoading, error, data } = useWordSearch(query)

  if (isLoading) {
    return <Loader label="Ищем определение..." />
  }

  if (error) {
    return (
      <ErrorMessage
        message={`${error} Можно попробовать другой запрос или открыть раздел изучения.`}
      />
    )
  }

  if (!data) {
    return (
      <EmptyState
        title="Не удалось подобрать карточку"
        description="Попробуй более распространённое слово, проверь написание или открой учебные подборки."
        primaryLink={{ label: 'Открыть раздел «Изучение»', to: '/learn' }}
        secondaryLink={{ label: 'Вернуться на главную', to: '/' }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <WordCard
        data={data}
        isFavorite={isFavorite(data.word)}
        onToggleFavorite={onToggleFavorite}
      />
      <DefinitionBlock
        definition={data.definition}
        simpleExplanation={data.simpleExplanation}
      />
      <ExamplesBlock examples={data.examples} />
      <UsageTips usageTips={data.usageTips} mistakes={data.mistakes} />
      <ContextAnalyzer word={data.word} styles={data.style} />
      <RelatedWords relatedWords={data.relatedWords} />
      <MiniQuiz word={data.word} relatedWords={data.relatedWords} />
    </div>
  )
}

function safeDecodeRouteQuery(value?: string): string {
  if (!value) {
    return ''
  }

  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function WordPage() {
  const { query: rawQuery } = useParams<{ query: string }>()
  const navigate = useNavigate()
  const query = safeDecodeRouteQuery(rawQuery)
  const { addRecentSearch } = useRecentSearches()
  const { isFavorite, toggleFavorite } = useFavorites()

  useEffect(() => {
    if (!query) {
      return
    }

    addRecentSearch(query)
  }, [addRecentSearch, query])

  const handleSearch = (value: string) => {
    const normalized = value.trim()

    if (!normalized) {
      return
    }

    navigate(`/word/${encodeURIComponent(normalized)}`)
  }

  return (
    <div className="page-enter space-y-6">
      <section className="surface-hover rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            Карточка слова
          </p>
          <Link
            to="/"
            className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Назад
          </Link>
        </div>
        <SearchBar
          initialValue={query}
          onSearch={handleSearch}
          suggestions={searchSuggestions}
        />
        <p className="mt-3 text-xs text-slate-500">
          Если слово не найдено в источнике, сервис покажет безопасный fallback и рекомендации по контексту.
        </p>
      </section>

      <WordLookupResult
        key={query}
        query={query}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  )
}
