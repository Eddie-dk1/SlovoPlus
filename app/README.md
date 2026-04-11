# SlovoPlus

SlovoPlus is a React + TypeScript app for looking up words, showing definitions, usage examples, stylistic hints, and small learning helpers for Russian vocabulary practice.

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
- `src/hooks/` - search, favorites, recent searches
- `src/pages/` - main routes and page-level UI
- `tests/dictionary/` - reliability, provider, validation, and retry behavior tests
