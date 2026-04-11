import assert from 'node:assert/strict'
import test from 'node:test'
import { fetchWithResilience } from '../../src/services/dictionary/http'

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

test('already aborted signal does not start fetch', async () => {
  const originalFetch = globalThis.fetch
  let fetchCalls = 0
  globalThis.fetch = async () => {
    fetchCalls += 1
    return new Response('{}', { status: 200 })
  }

  try {
    await assert.rejects(
      fetchWithResilience('https://example.test/already-aborted', {
        signal: AbortSignal.abort(),
      }),
      isAbortError,
    )

    assert.equal(fetchCalls, 0)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('abort during retry delay interrupts waiting immediately', async () => {
  const originalFetch = globalThis.fetch
  let fetchCalls = 0
  globalThis.fetch = async () => {
    fetchCalls += 1
    return new Response('{}', { status: 500 })
  }

  const controller = new AbortController()
  const startedAt = Date.now()
  const abortTimer = setTimeout(() => controller.abort(), 20)

  try {
    await assert.rejects(
      fetchWithResilience('https://example.test/retry-delay-abort', {
        signal: controller.signal,
        retries: 1,
        retryDelayMs: 1_000,
        timeoutMs: 100,
      }),
      isAbortError,
    )

    assert.equal(fetchCalls, 1)
    assert.equal(Date.now() - startedAt < 300, true)
  } finally {
    clearTimeout(abortTimer)
    globalThis.fetch = originalFetch
  }
})

test('non-aborted retry scenario still retries and succeeds', async () => {
  const originalFetch = globalThis.fetch
  let fetchCalls = 0
  globalThis.fetch = async () => {
    fetchCalls += 1

    if (fetchCalls === 1) {
      return new Response('{}', { status: 500 })
    }

    return new Response('{"ok":true}', { status: 200 })
  }

  try {
    const response = await fetchWithResilience('https://example.test/retry-success', {
      retries: 1,
      retryDelayMs: 1,
      timeoutMs: 100,
    })

    assert.equal(response.status, 200)
    assert.equal(fetchCalls, 2)
  } finally {
    globalThis.fetch = originalFetch
  }
})
