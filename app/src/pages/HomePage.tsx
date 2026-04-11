import { useNavigate } from 'react-router-dom'
import { FavoritesList } from '../components/features/home/FavoritesList'
import { RecentSearches } from '../components/features/home/RecentSearches'
import { WordOfTheDay } from '../components/features/home/WordOfTheDay'
import { SearchBar } from '../components/ui/SearchBar'
import { searchSuggestions } from '../data/searchSuggestions'
import { useFavorites } from '../hooks/useFavorites'
import { useRecentSearches } from '../hooks/useRecentSearches'

export function HomePage() {
  const navigate = useNavigate()
  const { recentSearches, addRecentSearch } = useRecentSearches()
  const { favorites } = useFavorites()
  const featuredWords = searchSuggestions.slice(0, 6)

  const handleSearch = (value: string) => {
    const normalized = value.trim()

    if (!normalized) {
      return
    }

    addRecentSearch(normalized)
    navigate(`/word/${encodeURIComponent(normalized)}`)
  }

  const openRandomWord = () => {
    if (searchSuggestions.length === 0) {
      return
    }

    const randomIndex = Math.floor(Math.random() * searchSuggestions.length)
    handleSearch(searchSuggestions[randomIndex])
  }

  return (
    <div className="page-enter space-y-6">
      <section className="surface-hover overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/50 p-8 shadow-sm md:p-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
          Поиск и анализ слова
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Умный словарь русской лексики
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Введи слово, чтобы получить определение, примеры, стилистику и
          рекомендации по употреблению.
        </p>

        <div className="mt-8">
          <SearchBar onSearch={handleSearch} suggestions={searchSuggestions} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openRandomWord}
            className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Случайное слово
          </button>
          {featuredWords.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => handleSearch(word)}
              className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              {word}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <WordOfTheDay />
        <RecentSearches searches={recentSearches} />
      </div>

      <FavoritesList favorites={favorites} />
    </div>
  )
}
