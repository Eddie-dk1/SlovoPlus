import { useCallback, useState } from 'react'
import { readStoredStringArray, writeStoredStringArray } from '../utils/storage'

const STORAGE_KEY = 'slovo_plus_favorites'
const MAX_FAVORITES = 50

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() =>
    readStoredStringArray(STORAGE_KEY).slice(0, MAX_FAVORITES),
  )

  const toggleFavorite = useCallback((word: string) => {
    const normalized = word.trim()

    if (!normalized) {
      return
    }

    setFavorites((previous) => {
      const isAlreadyFavorite = previous.includes(normalized)
      const next = isAlreadyFavorite
        ? previous.filter((item) => item !== normalized)
        : [normalized, ...previous].slice(0, MAX_FAVORITES)

      writeStoredStringArray(STORAGE_KEY, next)
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (word: string) => favorites.includes(word.trim()),
    [favorites],
  )

  return { favorites, toggleFavorite, isFavorite }
}
