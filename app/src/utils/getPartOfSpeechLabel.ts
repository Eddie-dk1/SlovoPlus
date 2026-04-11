const partOfSpeechMap: Record<string, string> = {
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

function normalizePart(part: string): string {
  return part.trim().toLowerCase().replace(/[()]/g, '')
}

function mapSinglePart(part: string): string {
  const normalized = normalizePart(part)
  return partOfSpeechMap[normalized] ?? part
}

export function getPartOfSpeechLabel(partOfSpeech?: string): string | undefined {
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
    .map((token) => mapSinglePart(token))

  if (mapped.length === 0) {
    return partOfSpeech
  }

  return mapped.join(' / ')
}
