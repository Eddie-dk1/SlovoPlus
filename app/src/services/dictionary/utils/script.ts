import { hasCyrillic, hasLatin, matchesLanguage } from '../../../utils/language'

export { hasCyrillic, hasLatin }

export function isCyrillicWord(value: string): boolean {
  return /[а-яё]/i.test(value)
}

export function hasExpectedScript(value: string, isRussianInput: boolean): boolean {
  return matchesLanguage(value, isRussianInput ? 'ru' : 'en')
}

export function countWords(value: string): number {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

export function isAcceptableDefinition(
  definition: string,
  isRussianInput: boolean,
): boolean {
  const normalized = definition.trim()
  if (!normalized) {
    return false
  }

  if (isRussianInput) {
    return hasExpectedScript(normalized, true) && countWords(normalized) >= 3
  }

  return hasExpectedScript(normalized, false)
}
