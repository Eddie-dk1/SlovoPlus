import assert from 'node:assert/strict'
import test from 'node:test'
import {
  fromEnglishWiktionaryDefinition,
  fromRussianWiktionaryHtml,
} from '../../src/services/dictionary/providers/wiktionary'

test('parses Russian Wiktionary HTML without mixing languages', () => {
  const data = fromRussianWiktionaryHtml(
    'дом',
    `
      <h1>Русский</h1>
      <section><h3>Морфологические и синтаксические свойства</h3>
        <p><a>Существительное</a>, неодушевленное.</p>
      </section>
      <section><h3>Семантические свойства</h3></section>
      <section><h4 id="Значение">Значение</h4>
        <ol>
          <li>здание, предназначенное для жилья
            <span class="example-fullblock">◆ <span class="example-block">Новый <b>дом</b> построили быстро.</span></span>
          </li>
        </ol>
      </section>
      <section><h4 id="Синонимы">Синонимы</h4>
        <ol><li>жилище, здание, house</li></ol>
      </section>
      <h1>Английский</h1>
    `,
  )

  assert.notEqual(data, null)
  assert.equal(data?.language, 'ru')
  assert.equal(data?.partOfSpeech, 'noun')
  assert.match(data?.definition ?? '', /предназначенное для жилья/)
  assert.equal(data?.examples.includes('Новый дом построили быстро.'), true)
  assert.equal(data?.relatedWords.includes('house'), false)
})

test('parses English Wiktionary definition payload', () => {
  const data = fromEnglishWiktionaryDefinition('example', {
    en: [
      {
        partOfSpeech: 'Noun',
        definitions: [
          {
            definition:
              'Something that serves to illustrate a <a href="/wiki/rule" title="rule">rule</a>.',
            parsedExamples: [{ example: 'This sentence is an <b>example</b>.' }],
          },
        ],
      },
    ],
  })

  assert.notEqual(data, null)
  assert.equal(data?.language, 'en')
  assert.equal(data?.partOfSpeech, 'noun')
  assert.match(data?.definition ?? '', /illustrate a rule/)
  assert.equal(data?.examples.includes('This sentence is an example.'), true)
  assert.equal(data?.relatedWords.includes('rule'), true)
})
