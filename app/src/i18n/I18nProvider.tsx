import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { translations, type UiLanguage } from './translations'
import { I18nContext, type I18nContextValue } from './i18nContext'

const STORAGE_KEY = 'slovo_plus_ui_language'

function readInitialLanguage(): UiLanguage {
  if (typeof window === 'undefined') {
    return 'ru'
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'ru' || stored === 'en') {
      return stored
    }
  } catch {
    return 'ru'
  }

  return window.navigator.language.toLocaleLowerCase().startsWith('en') ? 'en' : 'ru'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<UiLanguage>(readInitialLanguage)

  const value = useMemo<I18nContextValue>(() => {
    const setLanguage = (nextLanguage: UiLanguage) => {
      setLanguageState(nextLanguage)

      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, nextLanguage)
        }
      } catch {
        // localStorage can be unavailable in private mode.
      }
    }

    return {
      language,
      setLanguage,
      t: translations[language],
    }
  }, [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
