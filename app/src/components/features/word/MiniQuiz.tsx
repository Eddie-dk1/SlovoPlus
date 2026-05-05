import { useMemo, useState } from 'react'
import { russianSemanticMap } from '../../../data/russianSemanticMap'
import type { WordLanguage } from '../../../types/word'

const englishDistractors = [
  'process',
  'result',
  'context',
  'method',
  'style',
  'reason',
  'example',
  'pattern',
  'system',
  'meaning',
]

interface MiniQuizProps {
  word: string
  relatedWords: string[]
  language?: WordLanguage
}

interface QuizRound {
  prompt: string
  correct: string
  options: string[]
}

function stableScore(seed: string): number {
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 2147483647
  }

  return hash
}

function stableOrder(values: string[], seed: string): string[] {
  return [...values].sort((left, right) => {
    return stableScore(`${seed}:${left}`) - stableScore(`${seed}:${right}`)
  })
}

function isCyrillicWord(value: string): boolean {
  return /[а-яё]/i.test(value)
}

function hasCyrillic(value: string): boolean {
  return /[а-яё]/i.test(value)
}

function hasLatin(value: string): boolean {
  return /[a-z]/i.test(value)
}

function matchesWordLanguage(value: string, russianInput: boolean): boolean {
  return russianInput ? hasCyrillic(value) : hasLatin(value)
}

function isValidQuizToken(value: string, russianInput: boolean): boolean {
  const trimmed = value.trim()
  if (trimmed.length < 3) {
    return false
  }

  if (/[\u0300-\u036f^*]/.test(trimmed)) {
    return false
  }

  if (russianInput) {
    return /^[а-яё -]+$/i.test(trimmed)
  }

  return /^[a-z -]+$/i.test(trimmed)
}

function rankDistractorCandidates(correct: string, values: string[]): string[] {
  return [...values].sort((left, right) => {
    const leftScore = Math.abs(left.length - correct.length)
    const rightScore = Math.abs(right.length - correct.length)

    if (leftScore !== rightScore) {
      return leftScore - rightScore
    }

    return Math.abs(left.split(/\s+/).length - correct.split(/\s+/).length) -
      Math.abs(right.split(/\s+/).length - correct.split(/\s+/).length)
  })
}

function getRussianDistractorPool(): string[] {
  return Array.from(new Set(Object.values(russianSemanticMap).flat()))
}

function buildRounds(word: string, relatedWords: string[]): QuizRound[] {
  const russianInput = isCyrillicWord(word)
  const uniqueRelated = relatedWords.filter(
    (item, index, array) =>
      item &&
      matchesWordLanguage(item, russianInput) &&
      isValidQuizToken(item, russianInput) &&
      array.indexOf(item) === index,
  )

  if (uniqueRelated.length < 2) {
    return []
  }

  const selectedCorrectAnswers = uniqueRelated.slice(0, 3)
  const russianPool = getRussianDistractorPool()

  return selectedCorrectAnswers.map((correct, index) => {
    const candidatePool = russianInput ? russianPool : englishDistractors

    const filteredPool = candidatePool
      .filter((item) => {
        return item !== correct && !selectedCorrectAnswers.includes(item)
      })

    const additional = stableOrder(
      rankDistractorCandidates(correct, filteredPool).slice(0, 6),
      `${word}:pool:${index}`,
    ).slice(0, 3)

    const options = stableOrder([correct, ...additional], `${word}:${index}`)

    return {
      prompt: russianInput
        ? `Выбери слово, которое ближе всего связано с «${word}».`
        : `Choose the word that is closest in meaning to "${word}".`,
      correct,
      options,
    }
  })
}

export function MiniQuiz({ word, relatedWords, language }: MiniQuizProps) {
  const rounds = useMemo(() => buildRounds(word, relatedWords), [relatedWords, word])
  const resolvedLanguage = language ?? (isCyrillicWord(word) ? 'ru' : 'en')
  const isRussian = resolvedLanguage === 'ru'
  const [currentRound, setCurrentRound] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [isChecked, setIsChecked] = useState(false)
  const [score, setScore] = useState(0)

  if (rounds.length === 0) {
    return (
      <section className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {isRussian ? 'Мини-квиз' : 'Mini quiz'}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {isRussian
            ? 'Квиз пока недоступен для этого слова.'
            : 'The quiz is not available for this word yet.'}
        </p>
      </section>
    )
  }

  const round = rounds[currentRound]
  const isCompleted = currentRound >= rounds.length

  if (isCompleted) {
    return (
      <section className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {isRussian ? 'Мини-квиз' : 'Mini quiz'}
        </h2>
        <p className="mt-2 text-slate-600">
          {isRussian ? 'Результат' : 'Result'}: {score} {isRussian ? 'из' : 'of'} {rounds.length}
        </p>
        <button
          type="button"
          onClick={() => {
            setCurrentRound(0)
            setSelected(null)
            setIsChecked(false)
            setScore(0)
          }}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {isRussian ? 'Пройти ещё раз' : 'Try again'}
        </button>
      </section>
    )
  }

  return (
    <section className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        {isRussian ? 'Мини-квиз' : 'Mini quiz'}
      </h2>
      <p className="mt-2 text-slate-600">
        {isRussian ? 'Вопрос' : 'Question'} {currentRound + 1} {isRussian ? 'из' : 'of'} {rounds.length}
      </p>
      <p className="mt-1 text-slate-700">{round.prompt}</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {round.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setSelected(option)
              setIsChecked(false)
            }}
            className={[
              'rounded-xl border px-4 py-3 text-left text-sm transition',
              selected === option
                ? 'border-blue-500 bg-blue-50 text-blue-800'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
            ].join(' ')}
          >
            {option}
          </button>
        ))}
      </div>

      {!isChecked ? (
        <button
          type="button"
          onClick={() => {
            setIsChecked(true)
            if (selected === round.correct) {
              setScore((previous) => previous + 1)
            }
          }}
          disabled={!selected}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRussian ? 'Проверить' : 'Check'}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setCurrentRound((previous) => previous + 1)
            setSelected(null)
            setIsChecked(false)
          }}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {currentRound + 1 === rounds.length
            ? isRussian ? 'Завершить' : 'Finish'
            : isRussian ? 'Следующий вопрос' : 'Next question'}
        </button>
      )}

      {isChecked && selected ? (
        <p
          className={[
            'mt-3 rounded-lg p-3 text-sm',
            selected === round.correct
              ? 'bg-emerald-50 text-emerald-800'
              : 'bg-amber-50 text-amber-800',
          ].join(' ')}
        >
          {selected === round.correct
            ? isRussian ? 'Верно!' : 'Correct.'
            : isRussian
              ? `Почти. Более точный вариант: «${round.correct}».`
              : `Not quite. The closer option is "${round.correct}".`}
        </p>
      ) : null}
    </section>
  )
}
