export const LEGACY_API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries'
export const FREE_DICTIONARY_API_BASE_URL = 'https://freedictionaryapi.com/api/v1/entries'
export const YANDEX_DICTIONARY_API_BASE_URL =
  'https://dictionary.yandex.net/api/v1/dicservice.json/lookup'
export const RELYC_DICTIONARY_API_BASE_URL =
  'https://dictionary.relycapp.com/api/v1/dictionary/lookup'
export const DATAMUSE_API_BASE_URL = 'https://api.datamuse.com/words'

const runtimeEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
const globalWithProcess = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> }
}
const processEnv =
  typeof globalWithProcess.process === 'object'
    ? globalWithProcess.process.env
    : undefined

export const YANDEX_DICTIONARY_API_KEY =
  runtimeEnv?.VITE_YANDEX_DICTIONARY_API_KEY ?? processEnv?.VITE_YANDEX_DICTIONARY_API_KEY

export const DICTIONARY_FETCH_TIMEOUT_MS = 7000
export const DICTIONARY_FETCH_RETRIES = 1
export const DICTIONARY_FETCH_RETRY_DELAY_MS = 250
