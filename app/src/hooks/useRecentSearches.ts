import { useCallback, useState } from 'react'
import { readStoredStringArray, writeStoredStringArray } from '../utils/storage'

const STORAGE_KEY = 'slovo_plus_recent_searches'
const MAX_HISTORY = 8

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    readStoredStringArray(STORAGE_KEY).slice(0, MAX_HISTORY),
  )

  const addRecentSearch = useCallback((query: string) => {
    const normalized = query.trim()

    if (!normalized) {
      return
    }

    setRecentSearches((previous) => {
      const next = [normalized, ...previous.filter((item) => item !== normalized)].slice(
        0,
        MAX_HISTORY,
      )

      writeStoredStringArray(STORAGE_KEY, next)
      return next
    })
  }, [])

  return { recentSearches, addRecentSearch }
}
