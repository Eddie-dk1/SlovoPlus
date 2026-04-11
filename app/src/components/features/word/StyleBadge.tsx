import type { WordStyle } from '../../../types/word'
import { getStyleLabel } from '../../../utils/getStyleLabel'

export function StyleBadge({ style }: { style: WordStyle }) {
  return (
    <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {getStyleLabel(style)}
    </span>
  )
}
