export interface LearningCollection {
  id: string
  title: string
  focus: string
  words: string[]
}

export const learningCollections: LearningCollection[] = [
  {
    id: 'formal-writing',
    title: 'Формальный стиль без перегруза',
    focus:
      'Подборка слов для делового и академического текста с акцентом на ясность.',
    words: ['осуществлять', 'поскольку', 'контекст', 'уместность'],
  },
  {
    id: 'anti-filler',
    title: 'Чистая речь без слов-паразитов',
    focus: 'Тренировка точных замен для разговорных вставок.',
    words: ['типа', 'как бы', 'короче', 'вроде'],
  },
  {
    id: 'stylistic-analysis',
    title: 'Стилистический анализ текста',
    focus:
      'Слова и понятия для разбора художественных и публицистических фрагментов.',
    words: ['ирония', 'сарказм', 'метафора', 'публицистика'],
  },
]
