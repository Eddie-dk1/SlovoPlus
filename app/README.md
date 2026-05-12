# SlovoPlus

SlovoPlus is a React + TypeScript app for looking up Russian and English words, showing definitions, usage examples, stylistic hints, and small learning helpers for vocabulary practice.

The interface supports Russian and English. The app detects whether the searched word is Russian or English, uses language-specific suggestions, and keeps dictionary lookup language-aware.

## Local Run

Requirements:
- Node.js 20+
- npm

Install and start:

```bash
npm install
npm run dev
```

The app runs with Vite. Open the local URL printed by the dev server.

## Commands

```bash
npm run dev
npm run lint
npm run test
npm run build
```

## Environment Variables

Optional:

```bash
VITE_YANDEX_DICTIONARY_API_KEY=your_key_here
```

If the key is missing, the app skips Yandex Dictionary and continues with other dictionary providers and fallbacks.

## Main Modules

- `src/services/dictionary/` - dictionary aggregation, retries, provider fallbacks, payload validation
- `src/services/dictionary/providers/` - provider-specific fetchers and response mappers
- `src/i18n/` - interface translations and UI language state
- `src/hooks/` - search, favorites, recent searches
- `src/pages/` - main routes and page-level UI
- `tests/dictionary/` - reliability, provider, validation, and retry behavior tests

## Dictionary Architecture

Dictionary lookup starts in `src/services/dictionary/index.ts`. It normalizes the user query, detects `ru` or `en`, validates the text, checks local overrides, then tries external providers in order. Russian lookups prefer Wiktionary, Relyc, Yandex, Free Dictionary, legacy API, and semantic fallback. English lookups prefer Wiktionary, Free Dictionary, Datamuse enrichment, and fallbacks.

Provider responses are normalized into `WordData`, then quality checks decide whether the app can show a reliable card or should return a clear empty/error state.
