export interface LearnCategory {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  whyItMatters: string
  whyItMattersEn: string
  examples: string[]
  examplesEn: string[]
}

export const categories: LearnCategory[] = [
  {
    id: 'filler-words',
    title: 'Слова-паразиты',
    titleEn: 'Filler words',
    description: 'Частые вставки, которые перегружают речь и размывают смысл.',
    descriptionEn: 'Frequent inserts that overload speech and blur meaning.',
    whyItMatters:
      'Помогают выиграть время в разговоре, но в учебных и деловых текстах снижают качество формулировок.',
    whyItMattersEn:
      'They can buy time in conversation, but reduce clarity in academic and business writing.',
    examples: ['типа', 'как бы', 'ну', 'короче'],
    examplesEn: ['like', 'kind of', 'well', 'basically'],
  },
  {
    id: 'bureaucratic',
    title: 'Канцеляризмы',
    titleEn: 'Bureaucratic wording',
    description: 'Обороты официально-делового стиля, которые утяжеляют простой текст.',
    descriptionEn: 'Formal turns of phrase that make simple writing heavier.',
    whyItMatters:
      'Полезны в документах, но в большинстве случаев лучше заменить на ясные и короткие формулировки.',
    whyItMattersEn:
      'They are useful in documents, but often work better when replaced with clear short wording.',
    examples: ['осуществлять', 'в рамках', 'имеет место'],
    examplesEn: ['implement', 'within the framework', 'takes place'],
  },
  {
    id: 'bookish',
    title: 'Книжная лексика',
    titleEn: 'Bookish vocabulary',
    description: 'Слова и обороты с более высоким стилевым регистром.',
    descriptionEn: 'Words and phrases with a higher stylistic register.',
    whyItMatters:
      'Добавляет выразительность в эссе и публицистике, но может звучать неестественно в бытовой речи.',
    whyItMattersEn:
      'It adds expressiveness to essays and journalism, but can sound unnatural in everyday speech.',
    examples: ['ибо', 'весьма', 'надлежит'],
    examplesEn: ['therefore', 'rather', 'shall'],
  },
  {
    id: 'spoken',
    title: 'Разговорная лексика',
    titleEn: 'Spoken vocabulary',
    description: 'Естественная лексика повседневного общения.',
    descriptionEn: 'Natural vocabulary for everyday communication.',
    whyItMatters:
      'Делает речь живой, но требует осторожности в академическом и официальном контексте.',
    whyItMattersEn:
      'It makes speech sound natural, but needs care in academic and official contexts.',
    examples: ['классно', 'прикольно', 'болтать'],
    examplesEn: ['awesome', 'cool', 'chat'],
  },
  {
    id: 'confusing-pairs',
    title: 'Часто путаемые слова',
    titleEn: 'Often confused words',
    description: 'Пары и группы слов с близким значением, но разными оттенками.',
    descriptionEn: 'Pairs and groups of words with close meanings but different shades.',
    whyItMatters:
      'Точное различение повышает качество аргументации и снижает стилистические ошибки.',
    whyItMattersEn:
      'Precise distinctions improve argument quality and reduce style mistakes.',
    examples: ['ирония / сарказм', 'одеть / надеть', 'эффектный / эффективный'],
    examplesEn: ['irony / sarcasm', 'affect / effect', 'compliment / complement'],
  },
  {
    id: 'figurative',
    title: 'Выразительные средства',
    titleEn: 'Figurative devices',
    description: 'Тропы и приемы, усиливающие образность и эмоциональность текста.',
    descriptionEn: 'Devices that make writing more vivid and expressive.',
    whyItMatters:
      'Полезны для анализа художественного текста и создания сильных авторских формулировок.',
    whyItMattersEn:
      'They help analyze literary texts and create stronger original phrasing.',
    examples: ['метафора', 'гипербола', 'олицетворение'],
    examplesEn: ['metaphor', 'hyperbole', 'personification'],
  },
]
