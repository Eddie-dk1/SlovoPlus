import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DefinitionBlock } from '../components/features/word/DefinitionBlock'
import { ExamplesBlock } from '../components/features/word/ExamplesBlock'
import { ContextAnalyzer } from '../components/features/word/ContextAnalyzer'
import { MiniQuiz } from '../components/features/word/MiniQuiz'
import { QuerySuggestions } from '../components/features/word/QuerySuggestions'
import { RelatedWords } from '../components/features/word/RelatedWords'
import { ReplacementSuggestions } from '../components/features/word/ReplacementSuggestions'
import { UsageTips } from '../components/features/word/UsageTips'
import { WordCard } from '../components/features/word/WordCard'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Loader } from '../components/ui/Loader'
import { SearchBar } from '../components/ui/SearchBar'
import { getReplacementSuggestions } from '../data/replacementSuggestions'
import { searchSuggestionsByLanguage } from '../data/searchSuggestions'
import { useFavorites } from '../hooks/useFavorites'
import { useRecentSearches } from '../hooks/useRecentSearches'
import { useWordSearch } from '../hooks/useWordSearch'
import { useI18n } from '../i18n/i18nContext'
import type { Translations } from '../i18n/translations'
import { detectWordLanguage } from '../utils/language'
import { getQuerySuggestions } from '../utils/querySuggestions'

function WordLookupResult({
  query,
  isFavorite,
  onToggleFavorite,
  t,
}: {
  query: string
  isFavorite: (word: string) => boolean
  onToggleFavorite: (word: string) => void
  t: Translations
}) {
  const { isLoading, error, data } = useWordSearch(query)
  const queryLanguage = detectWordLanguage(query) ?? 'ru'
  const querySuggestions = getQuerySuggestions(query, queryLanguage)

  if (isLoading) {
    return <Loader label={t.word.loading} />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorMessage
          message={`${error} ${t.word.errorSuffix}`}
        />
        <QuerySuggestions suggestions={querySuggestions} language={queryLanguage} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <EmptyState
          title={t.word.emptyTitle}
          description={t.word.emptyDescription}
          primaryLink={{
            label: t.word.openLearning,
            to: '/learn',
          }}
          secondaryLink={{
            label: t.word.backHome,
            to: '/',
          }}
        />
        <QuerySuggestions suggestions={querySuggestions} language={queryLanguage} />
      </div>
    )
  }

  const language = data.language ?? detectWordLanguage(data.word) ?? queryLanguage
  const replacementSuggestions = getReplacementSuggestions(data, language)

  return (
    <div className="space-y-4">
      <WordCard
        data={data}
        isFavorite={isFavorite(data.word)}
        onToggleFavorite={onToggleFavorite}
      />
      {data.source === 'fallback' ? (
        <QuerySuggestions suggestions={querySuggestions} language={language} />
      ) : null}
      <DefinitionBlock
        definition={data.definition}
        simpleExplanation={data.simpleExplanation}
        language={language}
      />
      <ExamplesBlock examples={data.examples} language={language} />
      <UsageTips usageTips={data.usageTips} mistakes={data.mistakes} language={language} />
      <ReplacementSuggestions
        suggestions={replacementSuggestions}
        language={language}
      />
      <ContextAnalyzer word={data.word} styles={data.style} language={language} />
      <RelatedWords relatedWords={data.relatedWords} language={language} />
      <MiniQuiz word={data.word} relatedWords={data.relatedWords} language={language} />
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
  const queryLanguage = detectWordLanguage(query) ?? 'ru'
  const { t } = useI18n()
  const { addRecentSearch } = useRecentSearches()
  const { isFavorite, toggleFavorite } = useFavorites()
  const suggestions = searchSuggestionsByLanguage[queryLanguage]

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
            {t.word.cardEyebrow}
          </p>
          <Link
            to="/"
            className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {t.word.back}
          </Link>
        </div>
        <SearchBar
          initialValue={query}
          placeholder={t.search.placeholder}
          language={queryLanguage}
          labels={t.search}
          onSearch={handleSearch}
          suggestions={suggestions}
        />
        <p className="mt-3 text-xs text-slate-500">{t.word.fallbackNotice}</p>
      </section>

      <WordLookupResult
        key={query}
        query={query}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        t={t}
      />
    </div>
  )
}
