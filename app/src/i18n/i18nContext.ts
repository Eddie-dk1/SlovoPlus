import { createContext, useContext } from 'react'
import type { translations, UiLanguage } from './translations'

export interface I18nContextValue {
  language: UiLanguage
  setLanguage: (language: UiLanguage) => void
  t: typeof translations.ru
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }

  return context
}
