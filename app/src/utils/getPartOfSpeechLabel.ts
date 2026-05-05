import type { WordLanguage } from '../types/word'

const russianPartOfSpeechMap: Record<string, string> = {
  noun: 'существительное',
  verb: 'глагол',
  adjective: 'прилагательное',
  adverb: 'наречие',
  pronoun: 'местоимение',
  preposition: 'предлог',
  conjunction: 'союз',
  interjection: 'междометие',
  particle: 'частица',
  numeral: 'числительное',
  article: 'артикль',
  phrase: 'фраза',
  idiom: 'идиома',
}

const englishPartOfSpeechMap: Record<string, string> = {
  noun: 'noun',
  verb: 'verb',
  adjective: 'adjective',
  adverb: 'adverb',
  pronoun: 'pronoun',
  preposition: 'preposition',
  conjunction: 'conjunction',
  interjection: 'interjection',
  particle: 'particle',
  numeral: 'numeral',
  article: 'article',
  phrase: 'phrase',
  idiom: 'idiom',
}

function normalizePart(part: string): string {
  return part.trim().toLowerCase().replace(/[()]/g, '')
}

function mapSinglePart(part: string, language: WordLanguage): string {
  const normalized = normalizePart(part)
  const map = language === 'ru' ? russianPartOfSpeechMap : englishPartOfSpeechMap
  return map[normalized] ?? part
}

export function getPartOfSpeechLabel(
  partOfSpeech?: string,
  language: WordLanguage = 'ru',
): string | undefined {
  if (!partOfSpeech) {
    return undefined
  }

  const separators = ['/', ',', ';']
  let tokens = [partOfSpeech]

  for (const separator of separators) {
    tokens = tokens.flatMap((token) => token.split(separator))
  }

  const mapped = tokens
    .map((token) => token.trim())
    .filter((token) => Boolean(token))
    .map((token) => mapSinglePart(token, language))

  if (mapped.length === 0) {
    return partOfSpeech
  }

  return mapped.join(' / ')
}
