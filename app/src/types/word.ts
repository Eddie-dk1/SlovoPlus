export type WordStyle =
  | 'нейтральное'
  | 'разговорное'
  | 'книжное'
  | 'официально-деловое'
  | 'публицистическое'

export type WordDataSource =
  | 'api'
  | 'semantic_assist'
  | 'local_override'
  | 'fallback'

export type WordLanguage = 'ru' | 'en'

export interface WordData {
  word: string
  language?: WordLanguage
  definition: string
  simpleExplanation?: string
  partOfSpeech?: string
  examples: string[]
  style: WordStyle[]
  usageTips: string[]
  mistakes: string[]
  relatedWords: string[]
  source: WordDataSource
}

export interface DictionaryApiEntry {
  word?: string
  phonetic?: string
  meanings?: Array<{
    partOfSpeech?: string
    definitions?: Array<{
      definition?: string
      example?: string
      synonyms?: string[]
    }>
  }>
}

export interface FreeDictionarySense {
  definition?: string
  examples?: string[]
  synonyms?: string[]
}

export interface FreeDictionaryEntry {
  language?: {
    code?: string
    name?: string
  }
  partOfSpeech?: string
  senses?: FreeDictionarySense[]
  synonyms?: string[]
}

export interface FreeDictionaryResponse {
  word?: string
  entries?: FreeDictionaryEntry[]
}
