function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

export function readStoredStringArray(key: string): string[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const value = window.localStorage.getItem(key)
    if (!value) {
      return []
    }

    const parsed = JSON.parse(value) as unknown
    if (!isStringArray(parsed)) {
      return []
    }

    return parsed
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item, index, array) => array.indexOf(item) === index)
  } catch {
    return []
  }
}

export function writeStoredStringArray(key: string, values: string[]): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(values))
  } catch {
    // Игнорируем ошибки localStorage (например, private mode/quota exceeded).
  }
}
