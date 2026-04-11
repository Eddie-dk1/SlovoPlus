export type DictionaryErrorCode = 'NOT_FOUND' | 'NETWORK' | 'UNKNOWN'

export class DictionaryError extends Error {
  code: DictionaryErrorCode

  constructor(message: string, code: DictionaryErrorCode) {
    super(message)
    this.name = 'DictionaryError'
    this.code = code
  }
}
