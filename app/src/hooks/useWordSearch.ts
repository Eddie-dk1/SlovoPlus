import { useEffect, useRef, useState } from 'react'
import { DictionaryError, fetchWordData } from '../services/dictionaryApi'
import type { WordData } from '../types/word'

interface UseWordSearchState {
  isLoading: boolean
  error: string | null
  data: WordData | null
}

export function useWordSearch(query: string) {
  const normalized = query.trim()
  const requestIdRef = useRef(0)
  const [state, setState] = useState<UseWordSearchState>({
    isLoading: Boolean(normalized),
    error: normalized ? null : 'Введите слово для поиска.',
    data: null,
  })

  useEffect(() => {
    if (!normalized) {
      return
    }

    requestIdRef.current += 1
    const currentRequestId = requestIdRef.current
    const abortController = new AbortController()
    const debounceTimer = setTimeout(() => {
      setState({ isLoading: true, error: null, data: null })

      fetchWordData(normalized, abortController.signal)
        .then((data) => {
          if (requestIdRef.current !== currentRequestId) {
            return
          }

          setState({ isLoading: false, error: null, data })
        })
        .catch((error: unknown) => {
          if (requestIdRef.current !== currentRequestId) {
            return
          }

          if (error instanceof DOMException && error.name === 'AbortError') {
            return
          }

          if (error instanceof DictionaryError) {
            setState({ isLoading: false, error: error.message, data: null })
            return
          }

          setState({
            isLoading: false,
            error: 'Не удалось получить данные по слову. Попробуйте позже.',
            data: null,
          })
        })
    }, 220)

    return () => {
      clearTimeout(debounceTimer)
      abortController.abort()
    }
  }, [normalized])

  if (!normalized) {
    return { isLoading: false, error: 'Введите слово для поиска.', data: null }
  }

  return state
}
