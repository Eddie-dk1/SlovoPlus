import type { WordLanguage } from '../types/word'

export function hasCyrillic(value: string): boolean {
  return /[а-яё]/i.test(value)
}

export function hasLatin(value: string): boolean {
  return /[a-z]/i.test(value)
}

export function detectWordLanguage(value: string): WordLanguage | null {
  const containsCyrillic = hasCyrillic(value)
  const containsLatin = hasLatin(value)

  if (containsCyrillic && !containsLatin) {
    return 'ru'
  }

  if (containsLatin && !containsCyrillic) {
    return 'en'
  }

  return null
}

export function isRussianLanguage(language: WordLanguage): boolean {
  return language === 'ru'
}

export function matchesLanguage(value: string, language: WordLanguage): boolean {
  if (language === 'ru') {
    return hasCyrillic(value) && !hasLatin(value)
  }

  return hasLatin(value) && !hasCyrillic(value)
}

export function isSupportedLookupText(value: string, language: WordLanguage): boolean {
  const normalized = value.trim()

  if (language === 'ru') {
    return /^[а-яё -]+$/i.test(normalized)
  }

  return /^[a-z -]+$/i.test(normalized)
}
