import { fetchWordData } from '../src/services/dictionaryApi'

const words = [
  'ирония',
  'сарказм',
  'метафора',
  'контекст',
  'хороший',
  'большой',
  'дружба',
  'дом',
  'мир',
  'абракадабра',
]

async function run() {
  for (const word of words) {
    try {
      const result = await fetchWordData(word)
      const related = result.relatedWords.slice(0, 4).join(', ') || '—'
      const examples = result.examples.length
      console.log(
        [
          word,
          'OK',
          result.source,
          result.partOfSpeech ?? '—',
          String(examples),
          related,
        ].join(' | '),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      console.log([word, 'ERR', message].join(' | '))
    }
  }
}

run()
