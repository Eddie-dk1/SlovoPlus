import assert from 'node:assert/strict'
import test from 'node:test'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

test('yandex success survives example enrichment failure', async () => {
  process.env.VITE_YANDEX_DICTIONARY_API_KEY = 'test-key'
  const { fetchWordData } = await import('../../src/services/dictionary/index')
  const originalFetch = globalThis.fetch

  globalThis.fetch = async (input: URL | RequestInfo): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.url

    if (url.includes('dictionary.relycapp.com')) {
      return jsonResponse({ error: 'not found' }, 404)
    }

    if (url.includes('dictionary.yandex.net')) {
      return jsonResponse({
        def: [
          {
            text: 'тест',
            pos: 'noun',
            tr: [{ text: 'проверка' }],
          },
        ],
      })
    }

    if (url.includes('freedictionaryapi.com')) {
      throw new Error('examples service down')
    }

    if (url.includes('dictionaryapi.dev')) {
      return jsonResponse({ error: 'not found' }, 404)
    }

    return jsonResponse({ error: 'not found' }, 404)
  }

  try {
    const data = await fetchWordData('тест')

    assert.equal(data.source, 'api')
    assert.match(data.definition, /проверка/i)
    assert.equal(data.examples.length > 0, true)
  } finally {
    globalThis.fetch = originalFetch
    delete process.env.VITE_YANDEX_DICTIONARY_API_KEY
  }
})

test('yandex success still enriches examples when free dictionary is available', async () => {
  process.env.VITE_YANDEX_DICTIONARY_API_KEY = 'test-key'
  const { fetchWordData } = await import('../../src/services/dictionary/index')
  const originalFetch = globalThis.fetch
  let freeExamplesCalls = 0

  globalThis.fetch = async (input: URL | RequestInfo): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.url

    if (url.includes('dictionary.relycapp.com')) {
      return jsonResponse({ error: 'not found' }, 404)
    }

    if (url.includes('dictionary.yandex.net')) {
      return jsonResponse({
        def: [
          {
            text: 'signal',
            pos: 'noun',
            tr: [
              {
                text: 'meaning',
                ex: [
                  {
                    text: 'The signal flashed across the hill.',
                    tr: [{ text: 'Сигнал мелькнул на холме.' }],
                  },
                ],
              },
            ],
          },
        ],
      })
    }

    if (url.includes('/api/v1/entries/en/signal')) {
      freeExamplesCalls += 1

      return jsonResponse({
        word: 'signal',
        entries: [
          {
            language: { code: 'en', name: 'English' },
            partOfSpeech: 'noun',
            senses: [
              {
                definition: 'A sign used to communicate information.',
                examples: ['The signal reached the receiver before the storm.'],
              },
            ],
          },
        ],
      })
    }

    if (url.includes('dictionaryapi.dev')) {
      return jsonResponse({ error: 'not found' }, 404)
    }

    return jsonResponse({ error: 'not found' }, 404)
  }

  try {
    const data = await fetchWordData('signal')

    assert.equal(data.source, 'api')
    assert.equal(
      data.examples.includes('The signal flashed across the hill.'),
      true,
    )
    assert.equal(freeExamplesCalls, 1)
  } finally {
    globalThis.fetch = originalFetch
    delete process.env.VITE_YANDEX_DICTIONARY_API_KEY
  }
})

test('yandex failure still preserves the current NETWORK error flow', async () => {
  process.env.VITE_YANDEX_DICTIONARY_API_KEY = 'test-key'
  const { fetchWordData } = await import('../../src/services/dictionary/index')
  const originalFetch = globalThis.fetch

  globalThis.fetch = async () => jsonResponse({ error: 'unavailable' }, 500)

  try {
    await assert.rejects(
      fetchWordData('signal'),
      (error: unknown) =>
        error instanceof Error &&
        error.name === 'DictionaryError' &&
        /temporarily unavailable/i.test(error.message),
    )
  } finally {
    globalThis.fetch = originalFetch
    delete process.env.VITE_YANDEX_DICTIONARY_API_KEY
  }
})
