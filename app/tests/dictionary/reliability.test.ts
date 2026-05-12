import assert from 'node:assert/strict'
import test from 'node:test'
import { fetchWordData } from '../../src/services/dictionary'
import { fetchFromFreeDictionaryApi } from '../../src/services/dictionary/providers/freeDictionary'
import { fetchFromLegacyApi } from '../../src/services/dictionary/providers/legacyDictionary'
import { fetchFromRelycDictionaryApi } from '../../src/services/dictionary/providers/relycDictionary'
import { fromYandexDictionaryResponse } from '../../src/services/dictionary/providers/yandex'
import { DictionaryError } from '../../src/services/dictionary/errors'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

test('free dictionary provider rejects malformed payload', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => jsonResponse(['unexpected'])

  try {
    await assert.rejects(
      fetchFromFreeDictionaryApi('тест', 'ru'),
      (error: unknown) => error instanceof DictionaryError && error.code === 'UNKNOWN',
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('free dictionary provider rejects payload with non-array senses', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () =>
    jsonResponse({
      word: 'тест',
      entries: [
        {
          language: { code: 'ru', name: 'Russian' },
          partOfSpeech: 'noun',
          senses: { definition: 'broken shape' },
        },
      ],
    })

  try {
    await assert.rejects(
      fetchFromFreeDictionaryApi('тест', 'ru'),
      (error: unknown) => error instanceof DictionaryError && error.code === 'UNKNOWN',
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('free dictionary provider rejects invalid nested field types with controlled error', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () =>
    jsonResponse({
      word: 'test',
      entries: [
        {
          language: { code: 'en', name: 'English' },
          partOfSpeech: 'noun',
          synonyms: 'broken',
          senses: [
            {
              definition: ['invalid'],
              examples: [123],
              synonyms: 'broken',
            },
          ],
        },
      ],
    })

  try {
    await assert.rejects(
      fetchFromFreeDictionaryApi('test', 'en'),
      (error: unknown) => error instanceof DictionaryError && error.code === 'UNKNOWN',
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('free dictionary provider still parses valid payloads after stricter validation', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () =>
    jsonResponse({
      word: 'signal',
      entries: [
        {
          language: { code: 'en', name: 'English' },
          partOfSpeech: 'noun',
          synonyms: ['sign'],
          senses: [
            {
              definition: 'A sign used to communicate information clearly.',
              examples: ['The signal reached the receiver before dawn.'],
              synonyms: ['message'],
            },
          ],
        },
      ],
    })

  try {
    const data = await fetchFromFreeDictionaryApi('signal', 'en')
    assert.notEqual(data, null)
    assert.match(data?.definition ?? '', /communicate information/i)
    assert.equal(
      data?.examples.includes('The signal reached the receiver before dawn.'),
      true,
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('relyc provider rejects malformed payload', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => jsonResponse(['unexpected'])

  try {
    await assert.rejects(
      fetchFromRelycDictionaryApi('корабль'),
      (error: unknown) => error instanceof DictionaryError && error.code === 'UNKNOWN',
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('legacy provider rejects malformed payload', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => jsonResponse({ not: 'an array' })

  try {
    await assert.rejects(
      fetchFromLegacyApi('test', 'en'),
      (error: unknown) => error instanceof DictionaryError && error.code === 'UNKNOWN',
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('yandex mapper safely returns null for malformed response shape', () => {
  const result = fromYandexDictionaryResponse('тест', { def: [] })
  assert.equal(result, null)
})

test('fallback chain continues when first provider fails with 500', async () => {
  const originalFetch = globalThis.fetch
  const attempts = new Map<string, number>()

  globalThis.fetch = async (input: URL | RequestInfo): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.url
    attempts.set(url, (attempts.get(url) ?? 0) + 1)

    if (url.includes('/api/v1/entries/ru/%D1%82%D0%B5%D1%81%D1%82')) {
      return jsonResponse({ error: 'temporary' }, 500)
    }

    if (url.includes('/api/v1/entries/all/%D1%82%D0%B5%D1%81%D1%82')) {
      return jsonResponse({
        word: 'тест',
        entries: [
          {
            language: { code: 'ru', name: 'Russian' },
            partOfSpeech: 'noun',
            senses: [
              {
                definition: 'Проверочное слово для тестирования системы.',
                examples: ['Этот тест демонстрирует работу цепочки fallback.'],
              },
            ],
          },
        ],
      })
    }

    return jsonResponse({ error: 'not found' }, 404)
  }

  try {
    const data = await fetchWordData('тест')
    assert.equal(data.source, 'api')
    assert.equal(data.sourceProvider, 'free_dictionary')
    assert.match(data.definition, /Проверочное слово/)
    assert.equal(
      Array.from(attempts.entries()).some(
        ([url, count]) =>
          url.includes('/api/v1/entries/ru/%D1%82%D0%B5%D1%81%D1%82') && count >= 2,
      ),
      true,
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('word card is not empty when relyc returns partially complete data', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input: URL | RequestInfo): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.url
    if (url.includes('dictionary.relycapp.com')) {
      return jsonResponse({
        word: 'книга',
        entries: [
          {
            lang: 'ru',
            lemma: 'книга',
            pos: 'NOUN',
            definitions: [{ locale: 'en', definitions: ['book'] }],
            forms: [{ form: 'книги', tag: 'plural' }],
          },
        ],
      })
    }

    return jsonResponse({ error: 'not found' }, 404)
  }

  try {
    const data = await fetchWordData('книга')
    assert.equal(data.word, 'книга')
    assert.equal(data.partOfSpeech, 'noun')
    assert.equal(data.examples.length > 0, true)
    assert.equal(data.definition.length > 0, true)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('fallback chain continues after semantic relyc result and prefers dictionary tier', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input: URL | RequestInfo): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.url

    if (url.includes('dictionary.relycapp.com')) {
      return jsonResponse({
        word: 'телефон',
        entries: [
          {
            lang: 'ru',
            lemma: 'телефон',
            pos: 'NOUN',
            definitions: [{ locale: 'en', definitions: ['phone', 'communication device'] }],
          },
        ],
      })
    }

    if (url.includes('/api/v1/entries/ru/%D1%82%D0%B5%D0%BB%D0%B5%D1%84%D0%BE%D0%BD')) {
      return jsonResponse({ error: 'not found' }, 404)
    }

    if (url.includes('/api/v1/entries/all/%D1%82%D0%B5%D0%BB%D0%B5%D1%84%D0%BE%D0%BD')) {
      return jsonResponse({
        word: 'телефон',
        entries: [
          {
            language: { code: 'ru', name: 'Russian' },
            partOfSpeech: 'noun',
            senses: [
              {
                definition: 'Аппарат для передачи и приема звуковой речи на расстоянии.',
                examples: ['Телефон зазвонил в самый разгар совещания.'],
              },
            ],
          },
        ],
      })
    }

    return jsonResponse({ error: 'not found' }, 404)
  }

  try {
    const data = await fetchWordData('телефон')
    assert.equal(data.source, 'api')
    assert.match(data.definition, /передачи и приема/i)
    assert.equal(data.examples[0]?.includes('совещания'), true)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('preserves display casing for queries like "Бог"', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input: URL | RequestInfo): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.url
    if (url.includes('dictionary.relycapp.com')) {
      return jsonResponse({
        word: 'бог',
        entries: [
          {
            lang: 'ru',
            lemma: 'бог',
            pos: 'NOUN',
            definitions: [{ locale: 'en', definitions: ['god'] }],
          },
        ],
      })
    }

    return jsonResponse({ error: 'not found' }, 404)
  }

  try {
    const data = await fetchWordData('Бог')
    assert.equal(data.word, 'Бог')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('network statuses 429/500 across providers result in controlled NETWORK error', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input: URL | RequestInfo): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.url

    if (url.includes('/api/v1/entries/en/zzzznonexistentword')) {
      return jsonResponse({ error: 'rate limit' }, 429)
    }

    if (url.includes('/api/v1/entries/all/zzzznonexistentword')) {
      return jsonResponse({ error: 'unavailable' }, 500)
    }

    if (url.includes('/api/v2/entries/en/zzzznonexistentword')) {
      return jsonResponse({ error: 'unavailable' }, 500)
    }

    return jsonResponse({ error: 'unavailable' }, 500)
  }

  try {
    await assert.rejects(
      fetchWordData('zzzznonexistentword'),
      (error: unknown) =>
        error instanceof DictionaryError &&
        error.code === 'NETWORK' &&
        /temporarily unavailable/i.test(error.message),
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('fetchWordData caches remote dictionary results by normalized word and language', async () => {
  const originalFetch = globalThis.fetch
  let fetchCalls = 0

  globalThis.fetch = async () => {
    fetchCalls += 1
    return new Response(
      `
        <h1>Русский</h1>
        <section><h3>Морфологические и синтаксические свойства</h3>
          <p><a>Существительное</a>, неодушевленное.</p>
        </section>
        <section><h4 id="Значение">Значение</h4>
          <ol>
            <li>условное слово для проверки словарного кэша
              <span class="example-fullblock">◆ <span class="example-block">Кэшслово помогает проверить повторный запрос.</span></span>
            </li>
          </ol>
        </section>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      },
    )
  }

  try {
    const first = await fetchWordData('Кэшслово')
    const second = await fetchWordData('КЭШСЛОВО')

    assert.equal(first.word, 'Кэшслово')
    assert.equal(first.sourceProvider, 'wiktionary')
    assert.equal(second.word, 'КЭШСЛОВО')
    assert.equal(second.sourceProvider, 'wiktionary')
    assert.match(second.definition, /проверки словарного кэша/)
    assert.equal(fetchCalls, 1)
  } finally {
    globalThis.fetch = originalFetch
  }
})
