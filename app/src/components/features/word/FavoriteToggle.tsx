interface FavoriteToggleProps {
  word: string
  isActive: boolean
  onToggle: (word: string) => void
}

export function FavoriteToggle({ word, isActive, onToggle }: FavoriteToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(word)}
      className={[
        'rounded-full border px-3 py-1 text-xs font-medium transition',
        isActive
          ? 'border-amber-300 bg-amber-100 text-amber-800'
          : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100',
      ].join(' ')}
    >
      {isActive ? 'В избранном' : 'В избранное'}
    </button>
  )
}
