import type { WordStyle } from '../types/word'
import type { WordLanguage } from '../types/word'
import { normalizeWord } from './normalizeWord'

type Register = 'neutral' | 'informal' | 'formal' | 'mixed'

export interface ContextAnalysisResult {
  register: Register
  summary: string
}

const informalMarkers = [
  'типа',
  'короче',
  'прикольно',
  'чувак',
  'блин',
  'ну',
  'вроде',
  'как бы',
]

const formalMarkers = [
  'в соответствии',
  'необходимо',
  'следует',
  'осуществлять',
  'на основании',
  'данный',
  'поскольку',
]

const englishInformalMarkers = [
  'kinda',
  'sort of',
  'gonna',
  'wanna',
  'cool',
  'dude',
]

const englishFormalMarkers = [
  'therefore',
  'pursuant',
  'accordingly',
  'required',
  'shall',
  'implementation',
]

function includesAny(source: string, items: string[]): boolean {
  return items.some((item) => source.includes(item))
}

function detectRegister(sentence: string, language: WordLanguage): Register {
  const normalized = sentence.toLocaleLowerCase(language === 'ru' ? 'ru-RU' : 'en-US')
  const hasInformal = includesAny(
    normalized,
    language === 'ru' ? informalMarkers : englishInformalMarkers,
  )
  const hasFormal = includesAny(
    normalized,
    language === 'ru' ? formalMarkers : englishFormalMarkers,
  )

  if (hasInformal && hasFormal) {
    return 'mixed'
  }

  if (hasInformal) {
    return 'informal'
  }

  if (hasFormal) {
    return 'formal'
  }

  return 'neutral'
}

function isWordPresent(word: string, sentence: string): boolean {
  const normalizedWord = normalizeWord(word)
  const normalizedSentence = normalizeWord(sentence)

  if (!normalizedWord || !normalizedSentence) {
    return false
  }

  return normalizedSentence.split(/\s+/).includes(normalizedWord)
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
  const register = detectRegister(cleanedSentence, language)
  const hasWord = isWordPresent(word, cleanedSentence)
  const isRussian = language === 'ru'

  if (!cleanedSentence) {
    return {
      register: 'neutral',
      summary: isRussian
        ? 'Недостаточно данных: введите предложение со словом для проверки.'
        : 'Not enough data: enter a sentence that contains the word.',
    }
  }

  if (!hasWord) {
    return {
      register,
      summary: isRussian
        ? `Слово «${word}» не найдено в предложении в точной форме. Проверь форму слова и повтори проверку.`
        : `The word "${word}" was not found in the sentence in this exact form. Check the form and try again.`,
    }
  }

  if (register === 'formal' && hasStyle(styles, 'разговорное')) {
    return {
      register,
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
      summary: isRussian
        ? `Слово «${word}» может звучать тяжело: разговорный контекст и книжно-официальная помета расходятся.`
        : `The word "${word}" may sound too heavy: the informal context conflicts with a formal or literary label.`,
    }
  }

  if (register === 'mixed') {
    return {
      register,
      summary: isRussian
        ? `Слово «${word}» использовано понятно, но в предложении смешаны разговорные и формальные маркеры.`
        : `The word "${word}" is understandable, but the sentence mixes informal and formal markers.`,
    }
  }

  if (!isRussian) {
    return {
      register,
      summary: `The word "${word}" fits the ${register === 'formal' ? 'formal' : register === 'informal' ? 'informal' : 'neutral'} context.`,
    }
  }

  return {
    register,
    summary: `Слово «${word}» использовано корректно в ${register === 'formal' ? 'формальном' : register === 'informal' ? 'разговорном' : 'нейтральном'} контексте.`,
  }
}
