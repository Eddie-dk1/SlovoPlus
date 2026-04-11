export function isCyrillicWord(value: string): boolean {
  return /[а-яё]/i.test(value)
}

export function hasCyrillic(value: string): boolean {
  return /[а-яё]/i.test(value)
}

export function hasLatin(value: string): boolean {
  return /[a-z]/i.test(value)
}

export function hasExpectedScript(value: string, isRussianInput: boolean): boolean {
  return isRussianInput ? hasCyrillic(value) : hasLatin(value)
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
    return hasCyrillic(normalized) && countWords(normalized) >= 3
  }

  return hasLatin(normalized)
}
