import type { WordLanguage, WordStyle } from '../../../types/word'
import { getStyleLabel } from '../../../utils/getStyleLabel'

export function StyleBadge({
  style,
  language = 'ru',
}: {
  style: WordStyle
  language?: WordLanguage
}) {
  return (
    <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {getStyleLabel(style, language)}
    </span>
  )
}
