export interface LearningCollection {
  id: string
  title: string
  titleEn: string
  focus: string
  focusEn: string
  words: string[]
  wordsEn: string[]
}

export const learningCollections: LearningCollection[] = [
  {
    id: 'formal-writing',
    title: 'Формальный стиль без перегруза',
    titleEn: 'Clear formal style',
    focus:
      'Подборка слов для делового и академического текста с акцентом на ясность.',
    focusEn: 'Words for business and academic writing with a focus on clarity.',
    words: ['осуществлять', 'поскольку', 'контекст', 'уместность'],
    wordsEn: ['implement', 'because', 'context', 'relevance'],
  },
  {
    id: 'anti-filler',
    title: 'Чистая речь без слов-паразитов',
    titleEn: 'Cleaner speech without fillers',
    focus: 'Тренировка точных замен для разговорных вставок.',
    focusEn: 'Practice precise replacements for conversational fillers.',
    words: ['типа', 'как бы', 'короче', 'вроде'],
    wordsEn: ['like', 'kind of', 'basically', 'sort of'],
  },
  {
    id: 'stylistic-analysis',
    title: 'Стилистический анализ текста',
    titleEn: 'Stylistic text analysis',
    focus:
      'Слова и понятия для разбора художественных и публицистических фрагментов.',
    focusEn: 'Words and concepts for analyzing literary and journalistic fragments.',
    words: ['ирония', 'сарказм', 'метафора', 'публицистика'],
    wordsEn: ['irony', 'sarcasm', 'metaphor', 'journalism'],
  },
  {
    id: 'confusing-pairs',
    title: 'Точные пары для эссе',
    titleEn: 'Precise pairs for essays',
    focus: 'Паронимы и близкие слова, где важны значение и сочетаемость.',
    focusEn: 'Confusing pairs where meaning and collocation matter.',
    words: ['одеть', 'надеть', 'эффектный', 'эффективный'],
    wordsEn: ['affect', 'effect', 'compliment', 'complement'],
  },
  {
    id: 'figurative-devices',
    title: 'Выразительные средства',
    titleEn: 'Figurative devices',
    focus: 'Базовые термины для анализа художественного и публицистического текста.',
    focusEn: 'Core terms for analyzing literary and journalistic writing.',
    words: ['метафора', 'гипербола', 'олицетворение', 'выразительность'],
    wordsEn: ['metaphor', 'hyperbole', 'personification', 'expressiveness'],
  },
]
