import { russianSemanticMap } from '../../../data/russianSemanticMap'
import type { WordData } from '../../../types/word'
import { getFallbackExamples } from '../fallbacks'
import { mergeWithHints } from '../hints'
import { ensureCompleteWordData } from '../normalizers'

export function fromSemanticFallback(query: string): WordData | null {
  const relatedWords = russianSemanticMap[query]

  if (!relatedWords || relatedWords.length === 0) {
    return null
  }

  return ensureCompleteWordData(
    query,
    mergeWithHints(
      {
        word: query,
        definition:
          'Точное толкование не найдено, поэтому приведено общее пояснение и близкие по смыслу слова.',
        simpleExplanation:
          'Используй похожие слова как ориентир и проверь контекст перед финальным выбором формулировки.',
        partOfSpeech: 'не определено',
        examples: getFallbackExamples(query, true),
        style: ['нейтральное'],
        usageTips: [
          'Сверь значение с контекстом и при необходимости замени на более точный синоним.',
        ],
        mistakes: ['Использование слова без проверки фактического значения в источнике.'],
        relatedWords,
        source: 'fallback',
      },
      query,
    ),
  )
}
