export function normalizeWord(input: string): string {
  return input
    .trim()
    .toLocaleLowerCase('ru-RU')
    .replace(/[.,!?;:()"'`]/g, '')
}
