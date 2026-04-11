import assert from 'node:assert/strict'
import test from 'node:test'
import { fromRelycDictionaryResponse } from '../../src/services/dictionary/providers/relycDictionary'

test('uses local override for frequent russian words when provider has no russian definition', () => {
  const data = fromRelycDictionaryResponse('кот', {
    word: 'кот',
    entries: [
      {
        lang: 'ru',
        lemma: 'кот',
        pos: 'NOUN',
        ipa: '/kot/',
        definitions: [
          { locale: 'en', definitions: ['cat'] },
        ],
      },
    ],
  })

  assert.notEqual(data, null)
  assert.equal(data?.partOfSpeech, 'noun')
  assert.match(data?.definition ?? '', /домашнее животное/i)
  assert.equal((data?.relatedWords.length ?? 0) > 0, true)
  assert.equal(data?.source, 'local_override')
})

test('uses provider definition when russian locale definition exists', () => {
  const data = fromRelycDictionaryResponse('книга', {
    word: 'книга',
    entries: [
      {
        lang: 'ru',
        lemma: 'книга',
        pos: 'NOUN',
        definitions: [
          { locale: 'ru', definitions: ['Печатное или рукописное издание в виде переплетённых листов.'] },
          { locale: 'en', definitions: ['book'] },
        ],
      },
    ],
  })

  assert.notEqual(data, null)
  assert.equal(data?.partOfSpeech, 'noun')
  assert.match(data?.definition ?? '', /Печатное/)
})

test('builds semantic russian definition from english glosses for non-overridden words', () => {
  const data = fromRelycDictionaryResponse('корабль', {
    word: 'корабль',
    entries: [
      {
        lang: 'ru',
        lemma: 'корабль',
        pos: 'NOUN',
        definitions: [{ locale: 'en', definitions: ['ship', 'vessel'] }],
      },
    ],
  })

  assert.notEqual(data, null)
  assert.match(data?.definition ?? '', /судно/)
  assert.match(data?.simpleExplanation ?? '', /водн|транспорт|контекст/i)
  assert.equal(data?.source, 'semantic_assist')
})

test('collects english glosses from non-preferred entries for russian words', () => {
  const data = fromRelycDictionaryResponse('телефон', {
    word: 'телефон',
    entries: [
      {
        lang: 'ru',
        lemma: 'телефон',
        pos: 'NOUN',
        definitions: [],
      },
      {
        lang: 'en',
        lemma: 'telefon',
        pos: 'NOUN',
        definitions: [{ locale: 'en', definitions: ['telephone', 'phone communication device'] }],
      },
    ],
  })

  assert.notEqual(data, null)
  assert.match(data?.definition ?? '', /устройство|связ/i)
  assert.equal(data?.source, 'semantic_assist')
})

test('builds communication-device semantic card for телефон from english glosses', () => {
  const data = fromRelycDictionaryResponse('телефон', {
    word: 'телефон',
    entries: [
      {
        lang: 'ru',
        lemma: 'телефон',
        pos: 'NOUN',
        definitions: [{ locale: 'en', definitions: ['telephone', 'phone communication device'] }],
      },
    ],
  })

  assert.notEqual(data, null)
  assert.equal(data?.partOfSpeech, 'noun')
  assert.match(data?.definition ?? '', /устройство/i)
  assert.match(data?.simpleExplanation ?? '', /связ|общен|коммуник/i)
  assert.equal((data?.examples ?? []).some((example) => /типичный контекст|общее пояснение/i.test(example)), false)
  assert.equal(data?.source, 'semantic_assist')
})

test('handles spelling-of english gloss and still builds semantic card', () => {
  const data = fromRelycDictionaryResponse('телефон', {
    word: 'телефон',
    entries: [
      {
        lang: 'ru',
        lemma: 'телефон',
        pos: 'NOUN',
        definitions: [{ locale: 'en', definitions: ['Cyrillic spelling of telefon'] }],
      },
    ],
  })

  assert.notEqual(data, null)
  assert.match(data?.definition ?? '', /устройство|связ/i)
  assert.equal(data?.source, 'semantic_assist')
})

test('builds movement verb semantic card for бегать from english glosses', () => {
  const data = fromRelycDictionaryResponse('бегать', {
    word: 'бегать',
    entries: [
      {
        lang: 'ru',
        lemma: 'бегать',
        pos: 'VERB',
        definitions: [{ locale: 'en', definitions: ['to run', 'move quickly'] }],
      },
    ],
  })

  assert.notEqual(data, null)
  assert.equal(data?.partOfSpeech, 'verb')
  assert.match(data?.definition ?? '', /быстро|бег|передвиг/i)
  assert.match(data?.simpleExplanation ?? '', /двигать|движ/i)
  assert.equal((data?.examples ?? []).some((example) => /типичный контекст|общее пояснение/i.test(example)), false)
  assert.equal(data?.source, 'semantic_assist')
})

test('builds reading verb semantic card for читать from english glosses', () => {
  const data = fromRelycDictionaryResponse('читать', {
    word: 'читать',
    entries: [
      {
        lang: 'ru',
        lemma: 'читать',
        pos: 'VERB',
        definitions: [{ locale: 'en', definitions: ['to read', 'study written text'] }],
      },
    ],
  })

  assert.notEqual(data, null)
  assert.equal(data?.partOfSpeech, 'verb')
  assert.match(data?.definition ?? '', /письменный текст|текст/i)
  assert.match(data?.simpleExplanation ?? '', /текст|книг|знаком/i)
  assert.equal(data?.source, 'semantic_assist')
})

test('preserves deity semantic behavior for бог from english glosses', () => {
  const data = fromRelycDictionaryResponse('бог', {
    word: 'бог',
    entries: [
      {
        lang: 'ru',
        lemma: 'бог',
        pos: 'NOUN',
        definitions: [{ locale: 'en', definitions: ['god', 'deity'] }],
      },
    ],
  })

  assert.notEqual(data, null)
  assert.equal(data?.partOfSpeech, 'noun')
  assert.match(data?.definition ?? '', /сверхъестествен|религиозн/i)
  assert.equal(data?.source, 'semantic_assist')
})

test('returns null for relyc payload without usable definitions', () => {
  const data = fromRelycDictionaryResponse('корабль', {
    word: 'корабль',
    entries: [
      {
        lang: 'ru',
        lemma: 'корабль',
        pos: 'NOUN',
        definitions: [],
        forms: [{ form: 'корабли', tag: 'plural' }],
      },
    ],
  })

  assert.equal(data, null)
})
