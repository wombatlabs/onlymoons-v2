import { create } from 'zustand'
import { localeStrings } from '../../data/locale-strings'
import { SupportedLanguage } from '../../types'

export interface ILocale {
  defaultLang?: SupportedLanguage
  setDefaultLang: (defaultLang?: SupportedLanguage) => void
  getString: (key: string | string[] | TemplateStringsArray, lang?: SupportedLanguage) => string
}

export const useLocale = create<ILocale>((set, get) => ({
  setDefaultLang: (defaultLang) => {
    set({ defaultLang })
  },
  getString: (key, lang) => {
    const _key = typeof key === 'string' ? key : key.join('')
    const _lang = lang ?? get().defaultLang
    if (localeStrings[_key]) {
      if (_lang) {
        if (localeStrings[_key][_lang]) {
          return localeStrings[_key][_lang] as string
        }
      }
    }
    return _key
  },
}))
