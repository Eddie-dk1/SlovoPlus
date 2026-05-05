import {
  DICTIONARY_FETCH_RETRIES,
  DICTIONARY_FETCH_RETRY_DELAY_MS,
  DICTIONARY_FETCH_TIMEOUT_MS,
} from './constants'

interface FetchResilientOptions {
  signal?: AbortSignal
  headers?: HeadersInit
  timeoutMs?: number
  retries?: number
  retryDelayMs?: number
}

function createAbortError(): DOMException {
  return new DOMException('Aborted', 'AbortError')
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || (status >= 500 && status <= 599)
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw createAbortError()
  }
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  throwIfAborted(signal)

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }

    const onAbort = () => {
      cleanup()
      reject(createAbortError())
    }

    const timer = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)

    if (!signal) {
      return
    }

    if (signal.aborted) {
      cleanup()
      reject(createAbortError())
      return
    }

    signal.addEventListener('abort', onAbort, { once: true })
  })
}

export async function fetchWithResilience(
  url: string,
  {
    signal,
    headers,
    timeoutMs = DICTIONARY_FETCH_TIMEOUT_MS,
    retries = DICTIONARY_FETCH_RETRIES,
    retryDelayMs = DICTIONARY_FETCH_RETRY_DELAY_MS,
  }: FetchResilientOptions = {},
): Promise<Response> {
  const maxAttempts = retries + 1

  throwIfAborted(signal)

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    throwIfAborted(signal)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    const abortFromParent = () => controller.abort()

    signal?.addEventListener('abort', abortFromParent, { once: true })

    try {
      const response = await fetch(url, { headers, signal: controller.signal })

      if (attempt < maxAttempts && isRetryableStatus(response.status)) {
        await wait(retryDelayMs, signal)
        continue
      }

      return response
    } catch (error) {
      if (isAbortError(error)) {
        if (signal?.aborted) {
          throw error
        }

        if (attempt < maxAttempts) {
          await wait(retryDelayMs, signal)
          continue
        }
      }

      if (attempt < maxAttempts) {
        await wait(retryDelayMs, signal)
        continue
      }

      throw error
    } finally {
      clearTimeout(timeout)
      signal?.removeEventListener('abort', abortFromParent)
    }
  }

  throw new Error('Unreachable fetch retry state')
}
