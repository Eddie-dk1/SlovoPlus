import type { WordStyle } from '../types/word'
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

function includesAny(source: string, items: string[]): boolean {
  return items.some((item) => source.includes(item))
}

function detectRegister(sentence: string): Register {
  const normalized = sentence.toLocaleLowerCase('ru-RU')
  const hasInformal = includesAny(normalized, informalMarkers)
  const hasFormal = includesAny(normalized, formalMarkers)

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
): ContextAnalysisResult {
  const cleanedSentence = sentence.trim()
  const register = detectRegister(cleanedSentence)
  const hasWord = isWordPresent(word, cleanedSentence)

  if (!cleanedSentence) {
    return {
      register: 'neutral',
      summary: 'Недостаточно данных: введите предложение со словом для проверки.',
    }
  }

  if (!hasWord) {
    return {
      register,
      summary: `Слово «${word}» не найдено в предложении в точной форме. Проверь форму слова и повтори проверку.`,
    }
  }

  if (register === 'formal' && hasStyle(styles, 'разговорное')) {
    return {
      register,
      summary: `Слово «${word}» выглядит неуместно: формальный контекст конфликтует с разговорной пометой.`,
    }
  }

  if (
    register === 'informal' &&
    (hasStyle(styles, 'книжное') || hasStyle(styles, 'официально-деловое'))
  ) {
    return {
      register,
      summary: `Слово «${word}» может звучать тяжело: разговорный контекст и книжно-официальная помета расходятся.`,
    }
  }

  if (register === 'mixed') {
    return {
      register,
      summary: `Слово «${word}» использовано понятно, но в предложении смешаны разговорные и формальные маркеры.`,
    }
  }

  return {
    register,
    summary: `Слово «${word}» использовано корректно в ${register === 'formal' ? 'формальном' : register === 'informal' ? 'разговорном' : 'нейтральном'} контексте.`,
  }
}
