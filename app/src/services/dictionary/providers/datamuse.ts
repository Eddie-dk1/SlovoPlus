import { DATAMUSE_API_BASE_URL } from '../constants'
import { fetchWithResilience } from '../http'
import { sanitizeRelatedWords } from '../normalizers'

interface DatamuseWord {
  word?: string
}

function parseDatamusePayload(raw: unknown): DatamuseWord[] {
  if (!Array.isArray(raw)) {
    return []
  }

  return raw.filter(
    (item): item is DatamuseWord =>
      typeof item === 'object' &&
      item !== null &&
      (item as DatamuseWord).word !== undefined &&
      typeof (item as DatamuseWord).word === 'string',
  )
}

export async function fetchDatamuseRelatedWords(
  query: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const response = await fetchWithResilience(
    `${DATAMUSE_API_BASE_URL}?ml=${encodeURIComponent(query)}&max=12`,
    { signal },
  )

  if (!response.ok) {
    return []
  }

  const payload = parseDatamusePayload(await response.json())
  return sanitizeRelatedWords(
    query,
    payload.map((item) => item.word ?? ''),
    false,
  )
}
