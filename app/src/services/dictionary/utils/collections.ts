export function uniqueValues(values: string[], max = 6): string[] {
  return values
    .map((item) => item.trim())
    .filter((item) => Boolean(item))
    .filter((item, index, array) => array.indexOf(item) === index)
    .slice(0, max)
}

export function normalizeRelatedToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ё/g, 'е')
    .trim()
}
