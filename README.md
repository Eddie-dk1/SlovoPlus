# SlovoPlus

SlovoPlus is a web app for Russian vocabulary learning and contextual usage analysis.  
The project combines dictionary lookup, style hints, related words, and lightweight learning tools (history, favorites, mini-quiz).

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Node.js test runner (`node --test` + `tsx`)

## Repository Layout

- `app/` - main frontend application
- `app/src/services/dictionary/` - dictionary aggregation, fallback chain, retries, validation
- `app/src/services/dictionary/providers/` - provider-specific adapters (Yandex, FreeDictionary, Legacy, Relyc)
- `app/tests/` - unit and reliability tests
- `techspec.md` - technical specification
- `mvp.md` - MVP plan

## Quick Start

Requirements:

- Node.js 20+
- npm

Run locally:

```bash
cd app
npm install
npm run dev
```

Open the local URL shown by Vite.

## Scripts

From `app/`:

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run preview
```

## Environment Variables

Optional (`app/.env`):

```bash
VITE_YANDEX_DICTIONARY_API_KEY=your_key_here
```

If the key is missing, the app skips Yandex Dictionary and continues with other providers and fallbacks.

## Security Notes

- Do not commit real API keys.
- `.env*`, `node_modules`, `dist`, and common local artifacts are excluded by `.gitignore`.
- Keep secrets only in local environment files or CI/CD secrets storage.

## Current Status

- `npm run lint` - passing
- `npm run test` - passing
- `npm run build` - passing
