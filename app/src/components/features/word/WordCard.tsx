import type { WordData } from '../../../types/word'
import { getPartOfSpeechLabel } from '../../../utils/getPartOfSpeechLabel'
import { FavoriteToggle } from './FavoriteToggle'
import { StyleBadge } from './StyleBadge'

interface WordCardProps {
  data: WordData
  isFavorite: boolean
  onToggleFavorite: (word: string) => void
}

export function WordCard({ data, isFavorite, onToggleFavorite }: WordCardProps) {
  const partOfSpeechLabel = getPartOfSpeechLabel(data.partOfSpeech)
  const sourceLabelMap: Record<WordData['source'], string> = {
    api: 'Словарное толкование',
    semantic_assist: 'Семантическое пояснение',
    local_override: 'Локальное определение',
    fallback: 'Ограниченные данные',
  }

  return (
    <section className="surface-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Карточка слова</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            {data.word}
          </h1>
          {partOfSpeechLabel ? (
            <p className="mt-2 text-sm text-slate-500">Часть речи: {partOfSpeechLabel}</p>
          ) : null}
          <p className="text-sm text-slate-500">
            Проверь определение, примеры и рекомендации перед использованием в тексте.
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
            <StyleBadge key={style} style={style} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
