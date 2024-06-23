import { SupportedLanguage } from '../types'

export type LocaleStrings = Record<string, Partial<Record<SupportedLanguage, string>>>

export const localeStrings: LocaleStrings = {
  Connect: {
    en: 'Connect',
  },
  'Connecting...': {
    en: 'Connecting...',
  },
  Documentation: {
    en: 'Documentation',
  },
  Locker: {
    en: 'Locker',
  },
  locks: {
    en: 'locks',
  },
}
