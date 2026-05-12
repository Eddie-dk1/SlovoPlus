import type { WordStyle } from '../types/word'
import type { WordLanguage } from '../types/word'
import { normalizeWord } from './normalizeWord'

type Register = 'neutral' | 'informal' | 'formal' | 'mixed'

export interface ContextAnalysisResult {
  register: Register
  summary: string
  matched: boolean
  matchedForm?: string
  reasons: string[]
}

const russianInformalMarkers = [
  'типа',
  'короче',
  'прикольно',
  'чувак',
  'блин',
  'ну',
  'вроде',
  'как бы',
  'че',
  'щас',
  'классно',
]

const russianFormalMarkers = [
  'в соответствии',
  'необходимо',
  'следует',
  'осуществлять',
  'осуществление',
  'на основании',
  'данный',
  'поскольку',
  'в целях',
  'надлежит',
  'уведомление',
]

const englishInformalMarkers = [
  'kinda',
  'sort of',
  'gonna',
  'wanna',
  'gotta',
  'cool',
  'dude',
  'lol',
  'yeah',
]

const englishFormalMarkers = [
  'therefore',
  'pursuant',
  'in accordance with',
  'accordingly',
  'required',
  'shall',
  'hereby',
  'whereas',
  'implementation',
]

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function includesMarker(source: string, marker: string): boolean {
  const pattern = new RegExp(`(^|[^\\p{L}])${escapeRegExp(marker)}($|[^\\p{L}])`, 'iu')
  return pattern.test(source)
}

function findMarkers(source: string, items: string[]): string[] {
  return items.filter((item) => includesMarker(source, item))
}

function detectRegister(
  sentence: string,
  language: WordLanguage,
): { register: Register; reasons: string[] } {
  const normalized = sentence.toLocaleLowerCase(language === 'ru' ? 'ru-RU' : 'en-US')
  const informal = findMarkers(
    normalized,
    language === 'ru' ? russianInformalMarkers : englishInformalMarkers,
  )
  const formal = findMarkers(
    normalized,
    language === 'ru' ? russianFormalMarkers : englishFormalMarkers,
  )
  const hasInformal = informal.length > 0
  const hasFormal = formal.length > 0
  const reasons: string[] = []

  if (hasInformal) {
    reasons.push(
      language === 'ru'
        ? `найдены разговорные маркеры: ${informal.join(', ')}`
        : `informal markers found: ${informal.join(', ')}`,
    )
  }

  if (hasFormal) {
    reasons.push(
      language === 'ru'
        ? `найдены формальные маркеры: ${formal.join(', ')}`
        : `formal markers found: ${formal.join(', ')}`,
    )
  }

  if (hasInformal && hasFormal) {
    return { register: 'mixed', reasons }
  }

  if (hasInformal) {
    return { register: 'informal', reasons }
  }

  if (hasFormal) {
    return { register: 'formal', reasons }
  }

  return {
    register: 'neutral',
    reasons: [
      language === 'ru'
        ? 'выраженных разговорных или формальных маркеров не найдено'
        : 'no strong informal or formal markers found',
    ],
  }
}

function tokenize(sentence: string, language: WordLanguage): string[] {
  const pattern = language === 'ru' ? /[а-яё]+(?:-[а-яё]+)?/giu : /[a-z]+(?:-[a-z]+)?/giu
  return sentence
    .toLocaleLowerCase(language === 'ru' ? 'ru-RU' : 'en-US')
    .match(pattern) ?? []
}

function isRussianConsonant(value: string): boolean {
  return /^[бвгджзйклмнпрстфхцчшщ]$/i.test(value)
}

function addFormsWithEndings(forms: Set<string>, stem: string, endings: string[]): void {
  endings.forEach((ending) => forms.add(`${stem}${ending}`))
}

function buildRussianForms(word: string): Set<string> {
  const forms = new Set([word])

  if (word.length < 3) {
    return forms
  }

  if (word.endsWith('ть')) {
    const stem = word.slice(0, -2)
    const presentEndings = stem.endsWith('и')
      ? ['ю', 'шь', 'т', 'м', 'те', 'ят', 'л', 'ла', 'ли']
      : ['ю', 'ешь', 'ет', 'ем', 'ете', 'ют', 'л', 'ла', 'ли']

    presentEndings.forEach((ending) => forms.add(`${stem}${ending}`))
  }

  if (word.endsWith('ый') || word.endsWith('ий') || word.endsWith('ой')) {
    const stem = word.slice(0, -2)
    addFormsWithEndings(forms, stem, [
      'ого',
      'ому',
      'ым',
      'ом',
      'ая',
      'ое',
      'ые',
      'ых',
      'ыми',
      'ую',
    ])
  }

  if (word.endsWith('а')) {
    const stem = word.slice(0, -1)
    addFormsWithEndings(forms, stem, [
      'ы',
      'и',
      'е',
      'у',
      'ой',
      'ою',
      'ами',
      'ах',
    ])
  } else if (word.endsWith('я')) {
    const stem = word.slice(0, -1)
    addFormsWithEndings(forms, stem, [
      'и',
      'е',
      'ю',
      'ей',
      'ею',
      'ями',
      'ях',
    ])
  } else if (isRussianConsonant(word.at(-1) ?? '')) {
    addFormsWithEndings(forms, word, [
      'а',
      'у',
      'ом',
      'е',
      'ы',
      'ов',
      'ам',
      'ами',
      'ах',
    ])
  }

  return forms
}

function buildEnglishForms(word: string): Set<string> {
  const forms = new Set([word])

  if (word.length < 3) {
    return forms
  }

  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) {
    const stem = word.slice(0, -1)
    forms.add(`${stem}ies`)
    forms.add(`${stem}ied`)
  } else {
    forms.add(`${word}s`)
    forms.add(`${word}ed`)
  }

  forms.add(word.endsWith('e') ? `${word.slice(0, -1)}ing` : `${word}ing`)
  forms.add(word.endsWith('s') || word.endsWith('x') || word.endsWith('ch') || word.endsWith('sh') ? `${word}es` : `${word}s`)

  return forms
}

function buildSimpleForms(word: string, language: WordLanguage): Set<string> {
  const normalizedWord = normalizeWord(word)

  if (!normalizedWord) {
    return new Set()
  }

  return language === 'ru'
    ? buildRussianForms(normalizedWord)
    : buildEnglishForms(normalizedWord)
}

function findWordUsage(
  word: string,
  sentence: string,
  language: WordLanguage,
): { matched: boolean; matchedForm?: string; exact: boolean } {
  const normalizedWord = normalizeWord(word)
  const tokens = tokenize(sentence, language)

  if (!normalizedWord || tokens.length === 0) {
    return { matched: false, exact: false }
  }

  if (tokens.includes(normalizedWord)) {
    return { matched: true, matchedForm: normalizedWord, exact: true }
  }

  const forms = buildSimpleForms(normalizedWord, language)
  const matchedForm = tokens.find((token) => forms.has(token))

  return matchedForm
    ? { matched: true, matchedForm, exact: false }
    : { matched: false, exact: false }
}

function hasStyle(styles: WordStyle[], target: WordStyle): boolean {
  return styles.includes(target)
}

export function analyzeWordUsageInSentence(
  word: string,
  styles: WordStyle[],
  sentence: string,
  language: WordLanguage = 'ru',
): ContextAnalysisResult {
  const cleanedSentence = sentence.trim()
  const registerResult = detectRegister(cleanedSentence, language)
  const register = registerResult.register
  const wordUsage = findWordUsage(word, cleanedSentence, language)
  const isRussian = language === 'ru'

  if (!cleanedSentence) {
    return {
      register: 'neutral',
      matched: false,
      reasons: [
        isRussian
          ? 'предложение не введено'
          : 'sentence is empty',
      ],
      summary: isRussian
        ? 'Недостаточно данных: введите предложение со словом для проверки.'
        : 'Not enough data: enter a sentence that contains the word.',
    }
  }

  if (!wordUsage.matched) {
    return {
      register,
      matched: false,
      reasons: [
        ...registerResult.reasons,
        isRussian
          ? 'слово не найдено ни в точной форме, ни в простых словоформах'
          : 'the word was not found as an exact token or a simple English form',
      ],
      summary: isRussian
        ? `Слово «${word}» не найдено в предложении. Проверяются отдельные слова и простые словоформы, без совпадений внутри другого слова.`
        : `The word "${word}" was not found in the sentence. The check uses word boundaries and simple English forms.`,
    }
  }

  const matchReason = wordUsage.exact
    ? isRussian
      ? `найдена точная форма: ${wordUsage.matchedForm}`
      : `exact form found: ${wordUsage.matchedForm}`
    : isRussian
      ? `найдена простая словоформа: ${wordUsage.matchedForm}`
      : `simple word form found: ${wordUsage.matchedForm}`
  const reasons = [matchReason, ...registerResult.reasons]

  if (register === 'formal' && hasStyle(styles, 'разговорное')) {
    return {
      register,
      matched: true,
      matchedForm: wordUsage.matchedForm,
      reasons: [
        ...reasons,
        isRussian
          ? 'разговорная помета конфликтует с формальным контекстом'
          : 'the informal label conflicts with the formal context',
      ],
      summary: isRussian
        ? `Слово «${word}» выглядит неуместно: формальный контекст конфликтует с разговорной пометой.`
        : `The word "${word}" may not fit: the formal context conflicts with an informal usage label.`,
    }
  }

  if (
    register === 'informal' &&
    (hasStyle(styles, 'книжное') || hasStyle(styles, 'официально-деловое'))
  ) {
    return {
      register,
      matched: true,
      matchedForm: wordUsage.matchedForm,
      reasons: [
        ...reasons,
        isRussian
          ? 'книжно-официальная помета конфликтует с разговорным контекстом'
          : 'the formal or literary label conflicts with the informal context',
      ],
      summary: isRussian
        ? `Слово «${word}» может звучать тяжело: разговорный контекст и книжно-официальная помета расходятся.`
        : `The word "${word}" may sound too heavy: the informal context conflicts with a formal or literary label.`,
    }
  }

  if (register === 'mixed') {
    return {
      register,
      matched: true,
      matchedForm: wordUsage.matchedForm,
      reasons,
      summary: isRussian
        ? `Слово «${word}» использовано понятно, но в предложении смешаны разговорные и формальные маркеры.`
        : `The word "${word}" is understandable, but the sentence mixes informal and formal markers.`,
    }
  }

  if (!isRussian) {
    return {
      register,
      matched: true,
      matchedForm: wordUsage.matchedForm,
      reasons,
      summary: `The word "${word}" fits the ${register === 'formal' ? 'formal' : register === 'informal' ? 'informal' : 'neutral'} context.`,
    }
  }

  return {
    register,
    matched: true,
    matchedForm: wordUsage.matchedForm,
    reasons,
    summary: `Слово «${word}» использовано корректно в ${register === 'formal' ? 'формальном' : register === 'informal' ? 'разговорном' : 'нейтральном'} контексте.`,
  }
}
