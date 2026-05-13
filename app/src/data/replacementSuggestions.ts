import type { WordData, WordLanguage } from '../types/word'

export interface ReplacementSuggestion {
  phrase: string
  replacements: string[]
  note: string
  before: string
  after: string
}

const replacementsByLanguage: Record<
  WordLanguage,
  Record<string, ReplacementSuggestion>
> = {
  ru: {
    осуществлять: {
      phrase: 'осуществлять',
      replacements: ['делать', 'выполнять', 'проводить', 'проверять'],
      note: 'Выбирай конкретный глагол под действие: «проверять», «контролировать», «проводить».',
      before: 'Комиссия будет осуществлять проверку документов.',
      after: 'Комиссия проверит документы.',
    },
    'в рамках': {
      phrase: 'в рамках',
      replacements: ['в', 'при', 'во время', 'по'],
      note: 'Часто эту связку можно заменить коротким предлогом без потери смысла.',
      before: 'В рамках проекта мы изучили лексику.',
      after: 'В проекте мы изучили лексику.',
    },
    'имеет место': {
      phrase: 'имеет место',
      replacements: ['есть', 'происходит', 'наблюдается'],
      note: 'Оставляй «имеет место» только там, где нужен официальный тон.',
      before: 'В тексте имеет место повтор.',
      after: 'В тексте есть повтор.',
    },
    канцеляризм: {
      phrase: 'канцеляризмы',
      replacements: ['ясный глагол', 'короткая фраза', 'прямой порядок слов'],
      note: 'Ищи существительное с пустым глаголом и заменяй его одним точным действием.',
      before: 'Было произведено редактирование текста.',
      after: 'Текст отредактировали.',
    },
  },
  en: {
    implement: {
      phrase: 'implement',
      replacements: ['do', 'carry out', 'use', 'put into practice'],
      note: 'Use "implement" for systems, plans, and policies; choose a simpler verb for everyday actions.',
      before: 'We implemented a check of the text.',
      after: 'We checked the text.',
    },
    'within the framework': {
      phrase: 'within the framework',
      replacements: ['in', 'during', 'as part of'],
      note: 'This phrase is often heavier than the idea requires.',
      before: 'Within the framework of the course, we analyzed style.',
      after: 'In the course, we analyzed style.',
    },
    'takes place': {
      phrase: 'takes place',
      replacements: ['happens', 'occurs', 'is held'],
      note: 'Choose the replacement based on whether you mean an event, a process, or a location.',
      before: 'The discussion takes place after class.',
      after: 'The discussion happens after class.',
    },
  },
}

export function getReplacementSuggestions(
  data: WordData,
  language: WordLanguage,
): ReplacementSuggestion[] {
  const replacements = replacementsByLanguage[language]
  const candidates = [
    data.word,
    ...data.relatedWords,
    ...data.examples,
    data.definition,
    data.simpleExplanation ?? '',
  ]
    .join(' ')
    .toLowerCase()

  return Object.entries(replacements)
    .filter(([key]) => candidates.includes(key))
    .map(([, suggestion]) => suggestion)
}
