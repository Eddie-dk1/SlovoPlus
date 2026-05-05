import type { WordData } from '../../../types/word'
import { detectWordLanguage } from '../../../utils/language'
import { getPartOfSpeechLabel } from '../../../utils/getPartOfSpeechLabel'
import { FavoriteToggle } from './FavoriteToggle'
import { StyleBadge } from './StyleBadge'

interface WordCardProps {
  data: WordData
  isFavorite: boolean
  onToggleFavorite: (word: string) => void
}

export function WordCard({ data, isFavorite, onToggleFavorite }: WordCardProps) {
  const language = data.language ?? detectWordLanguage(data.word) ?? 'ru'
  const isRussian = language === 'ru'
  const partOfSpeechLabel = getPartOfSpeechLabel(data.partOfSpeech, language)
  const sourceLabelMap: Record<WordData['source'], string> = {
    api: isRussian ? 'Словарное толкование' : 'Dictionary entry',
    semantic_assist: isRussian ? 'Семантическое пояснение' : 'Semantic note',
    local_override: isRussian ? 'Локальное определение' : 'Local entry',
    fallback: isRussian ? 'Ограниченные данные' : 'Limited data',
  }

  return (
    <section className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            {isRussian ? 'Карточка слова' : 'Word card'}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            {data.word}
          </h1>
          {partOfSpeechLabel ? (
            <p className="mt-2 text-sm text-slate-500">
              {isRussian ? 'Часть речи' : 'Part of speech'}: {partOfSpeechLabel}
            </p>
          ) : null}
          <p className="text-sm text-slate-500">
            {isRussian
              ? 'Проверь определение, примеры и рекомендации перед использованием в тексте.'
              : 'Check the definition, examples, and usage notes before using the word.'}
          </p>
        </div>

        <span className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          {sourceLabelMap[data.source]}
        </span>
      </div>

      <div className="mt-4">
        <FavoriteToggle
          word={data.word}
          isActive={isFavorite}
          onToggle={onToggleFavorite}
        />
      </div>

      {data.style.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {data.style.map((style) => (
            <StyleBadge key={style} style={style} language={language} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
