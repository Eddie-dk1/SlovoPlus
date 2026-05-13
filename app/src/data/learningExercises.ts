import type { LearnCategory } from './categories'

export type LearningExerciseKind =
  | 'choose-style'
  | 'find-error'
  | 'replace-bureaucratic'

export interface LearningExercise {
  id: string
  categoryId: LearnCategory['id']
  kind: LearningExerciseKind
  title: string
  titleEn: string
  prompt: string
  promptEn: string
  options: string[]
  optionsEn: string[]
  correctIndex: number
  explanation: string
  explanationEn: string
}

export const learningExercises: LearningExercise[] = [
  {
    id: 'filler-style',
    categoryId: 'filler-words',
    kind: 'choose-style',
    title: 'Выбери стиль',
    titleEn: 'Choose the style',
    prompt: 'Какой стиль уместнее всего описывает слово «типа» в роли заполнителя паузы?',
    promptEn: 'Which style best describes "like" when it is used as a filler?',
    options: ['разговорное', 'официально-деловое', 'книжное'],
    optionsEn: ['spoken', 'formal', 'bookish'],
    correctIndex: 0,
    explanation: 'Это разговорный маркер. В учебном или деловом тексте его лучше убрать.',
    explanationEn: 'It is a spoken marker. In academic or business writing, it is usually better removed.',
  },
  {
    id: 'filler-error',
    categoryId: 'filler-words',
    kind: 'find-error',
    title: 'Найди ошибку',
    titleEn: 'Find the issue',
    prompt: 'Где слово-паразит сильнее всего мешает смыслу?',
    promptEn: 'Where does the filler weaken the meaning most?',
    options: [
      'Мы, типа, провели анализ текста.',
      'Он выбрал куртку типа спортивной.',
      'В словаре указан тип значения.',
    ],
    optionsEn: [
      'We, like, analyzed the text.',
      'Choose a sports-type jacket.',
      'The dictionary lists the meaning type.',
    ],
    correctIndex: 0,
    explanation: 'В первом варианте слово не добавляет значения и снижает точность формулировки.',
    explanationEn: 'In the first option, the word adds no meaning and reduces precision.',
  },
  {
    id: 'bureaucratic-replace',
    categoryId: 'bureaucratic',
    kind: 'replace-bureaucratic',
    title: 'Замени канцеляризм',
    titleEn: 'Replace heavy wording',
    prompt: 'Выбери более ясную замену: «осуществлять проверку».',
    promptEn: 'Choose a clearer replacement for "implement a check".',
    options: ['проверять', 'иметь место', 'в целях проверки'],
    optionsEn: ['check', 'take place', 'for the purpose of checking'],
    correctIndex: 0,
    explanation: 'Глагол «проверять» короче и понятнее, если не нужен официальный регистр.',
    explanationEn: '"Check" is shorter and clearer when formal register is not required.',
  },
  {
    id: 'bureaucratic-error',
    categoryId: 'bureaucratic',
    kind: 'find-error',
    title: 'Найди ошибку',
    titleEn: 'Find the issue',
    prompt: 'Какая фраза звучит тяжелее всего для обычного текста?',
    promptEn: 'Which phrase sounds heaviest for plain writing?',
    options: [
      'Мы проверили данные.',
      'Была осуществлена проверка данных.',
      'Данные проверены.',
    ],
    optionsEn: [
      'We checked the data.',
      'A check of the data was implemented.',
      'The data was checked.',
    ],
    correctIndex: 1,
    explanation: 'Пассивная конструкция с «осуществлена» делает простое действие громоздким.',
    explanationEn: 'The passive wording with "implemented" makes a simple action bulky.',
  },
  {
    id: 'bookish-style',
    categoryId: 'bookish',
    kind: 'choose-style',
    title: 'Выбери стиль',
    titleEn: 'Choose the style',
    prompt: 'Какой регистр у слова «ибо»?',
    promptEn: 'Which register does "shall" usually signal in modern plain English?',
    options: ['книжное', 'разговорное', 'нейтральное'],
    optionsEn: ['formal/legal', 'spoken', 'neutral'],
    correctIndex: 0,
    explanation: '«Ибо» звучит книжно и заметно повышает стиль текста.',
    explanationEn: 'It sounds formal or legalistic and raises the style of the text.',
  },
  {
    id: 'bookish-error',
    categoryId: 'bookish',
    kind: 'find-error',
    title: 'Найди ошибку',
    titleEn: 'Find the issue',
    prompt: 'Где книжное слово выглядит неуместным?',
    promptEn: 'Where does formal wording feel least appropriate?',
    options: [
      'Автор доказывает тезис, ибо спор важен для сюжета.',
      'Я опоздаю, ибо автобус задержался.',
      'Следует проверить источник, ибо вывод зависит от фактов.',
    ],
    optionsEn: [
      'The tenant shall pay rent on the first day.',
      'I shall grab coffee, because I am late.',
      'The applicant shall provide documents.',
    ],
    correctIndex: 1,
    explanation: 'В бытовой ситуации книжное «ибо» звучит искусственно.',
    explanationEn: 'In casual speech, legalistic wording sounds artificial.',
  },
  {
    id: 'spoken-style',
    categoryId: 'spoken',
    kind: 'choose-style',
    title: 'Выбери стиль',
    titleEn: 'Choose the style',
    prompt: 'Какой стиль у слова «прикольно»?',
    promptEn: 'Which style does "awesome" usually belong to?',
    options: ['разговорное', 'официально-деловое', 'книжное'],
    optionsEn: ['spoken', 'formal', 'bookish'],
    correctIndex: 0,
    explanation: 'Слово естественно в неформальной речи, но рискованно в деловом тексте.',
    explanationEn: 'It is natural in informal speech, but risky in business writing.',
  },
  {
    id: 'spoken-error',
    categoryId: 'spoken',
    kind: 'find-error',
    title: 'Найди ошибку',
    titleEn: 'Find the issue',
    prompt: 'Где разговорное слово нарушает регистр?',
    promptEn: 'Where does the spoken word break the register?',
    options: [
      'Докладчик классно объяснил тему друзьям.',
      'В заключении экспертизы указано, что решение классное.',
      'После пары ребята болтали о задании.',
    ],
    optionsEn: [
      'The talk was awesome.',
      'The official report states that the decision is awesome.',
      'They chatted after class.',
    ],
    correctIndex: 1,
    explanation: 'Официальный документ требует нейтральной оценки вместо разговорной.',
    explanationEn: 'An official report needs a neutral evaluation instead of a spoken one.',
  },
  {
    id: 'confusing-error',
    categoryId: 'confusing-pairs',
    kind: 'find-error',
    title: 'Найди ошибку',
    titleEn: 'Find the issue',
    prompt: 'Где слово выбрано неверно?',
    promptEn: 'Where is the word choice wrong?',
    options: [
      'Он надел пальто.',
      'Учитель одел пальто перед выходом.',
      'Мама одела ребенка тепло.',
    ],
    optionsEn: [
      'The effect was visible.',
      'The rule did not affect the result.',
      'The new law had a strong affect.',
    ],
    correctIndex: 1,
    explanation: 'Одежду на себя надевают, а одевают другого человека.',
    explanationEn: 'Affect is usually a verb; effect is the noun needed here.',
  },
  {
    id: 'confusing-style',
    categoryId: 'confusing-pairs',
    kind: 'choose-style',
    title: 'Выбери стиль',
    titleEn: 'Choose the style',
    prompt: 'Что важнее всего при выборе между паронимами?',
    promptEn: 'What matters most when choosing between confusing pairs?',
    options: ['точное значение', 'длина слова', 'количество букв'],
    optionsEn: ['exact meaning', 'word length', 'number of letters'],
    correctIndex: 0,
    explanation: 'Паронимы похожи внешне, но различаются смыслом и сочетаемостью.',
    explanationEn: 'Confusing pairs can look similar, but differ in meaning and usage.',
  },
  {
    id: 'figurative-style',
    categoryId: 'figurative',
    kind: 'choose-style',
    title: 'Выбери стиль',
    titleEn: 'Choose the style',
    prompt: 'Что делает метафора?',
    promptEn: 'What does a metaphor do?',
    options: [
      'переносит признаки одного явления на другое',
      'исправляет орфографию',
      'заменяет доказательство',
    ],
    optionsEn: [
      'transfers features from one thing to another',
      'fixes spelling',
      'replaces evidence',
    ],
    correctIndex: 0,
    explanation: 'Метафора строит образ через скрытое сравнение.',
    explanationEn: 'A metaphor builds an image through an implicit comparison.',
  },
  {
    id: 'figurative-error',
    categoryId: 'figurative',
    kind: 'find-error',
    title: 'Найди ошибку',
    titleEn: 'Find the issue',
    prompt: 'Где выразительное средство подменяет аргумент?',
    promptEn: 'Where does figurative language replace an argument?',
    options: [
      'Автор сравнивает город с лабиринтом и объясняет почему.',
      'Это решение - пропасть, поэтому оно плохое.',
      'Метафора помогает показать тревогу героя.',
    ],
    optionsEn: [
      'The writer calls the city a maze and explains why.',
      'This decision is a cliff, so it is bad.',
      'The metaphor shows the hero’s anxiety.',
    ],
    correctIndex: 1,
    explanation: 'Образность усиливает мысль, но не заменяет доказательство.',
    explanationEn: 'Imagery can strengthen a point, but it does not replace evidence.',
  },
]

export function getLearningExercisesByCategory(
  categoryId: LearnCategory['id'],
): LearningExercise[] {
  return learningExercises.filter((exercise) => exercise.categoryId === categoryId)
}
