import translations_en from '../../../translations/en'
import translations_nb from '../../../translations/nb'
import translations_nn from '../../../translations/nn'
import {
  getCookie,
  getSelectedLanguage,
  getTranslations,
  setCookie,
  updateLanguage,
} from '../utils'

const enMessages: Record<string, string> = translations_en
const nbMessages: Record<string, string> = translations_nb
const nnMessages: Record<string, string> = translations_nn

describe('LanguageProvider-utils', () => {
  afterEach(() => {
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })
  })

  describe('getCookie', () => {
    it('returnerer undefined når cookie ikke finnes', () => {
      const cookie = getCookie('my-cookie')
      expect(cookie).toBe('')
    })

    it('returnerer riktig cookie når den finnes', () => {
      document.cookie = 'my-cookie=value'
      const cookie = getCookie('my-cookie')
      expect(cookie).toBe('value')
    })
  })

  describe('setCookie', () => {
    it('setter cookie med riktig value', () => {
      expect(getCookie('my-cookie')).toBe(';expires')
      setCookie('my-cookie', 'updatedValue')

      const cookie = getCookie('my-cookie')
      expect(cookie).toBe('updatedValue')
    })
  })

  describe('getSelectedLanguage', () => {
    it('returnerer undefined når cookie ikke finnes', () => {
      const locale = getSelectedLanguage()
      expect(locale).toBe('nb')
    })

    it('returnerer riktig cookie når den finnes', () => {
      setCookie('decorator-language', 'en')
      const locale = getSelectedLanguage()
      expect(locale).toBe('en')
    })
  })

  describe('getTranslations', () => {
    it('returnerer alle keys og tekst i riktig språk for alle lokalene', () => {
      // Norsk bokmål er vår referanse
      const forventetLength = Object.keys(nbMessages).length

      const nbTranslations = getTranslations('nb')
      expect(nbTranslations['pageframework.title']).toBe('Pensjonskalkulator')
      const nbTranslationsKeys = Object.keys(nbTranslations)
      expect(nbTranslationsKeys).toHaveLength(forventetLength)

      const enTranslations = getTranslations('en')
      expect(enTranslations['pageframework.title']).toBe('Pension Calculator')
      const enTranslationsKeys = Object.keys(enTranslations)
      expect(enTranslationsKeys).toHaveLength(forventetLength)

      const nnTranslations = getTranslations('nn')
      expect(nnTranslations['pageframework.title']).toBe('Pensjonskalkulator')
      const nnTranslationsKeys = Object.keys(nnTranslations)
      expect(nnTranslationsKeys).toHaveLength(forventetLength)
    })

    it('oversettelser for bokmål inneholder alle oversettelser fra nynorsk', () => {
      const nbTranslations = getTranslations('nb')
      const nnTranslations = getTranslations('nn')

      const diff = Object.keys(nnTranslations).filter(
        (nbKey) => !Object.keys(nbTranslations).includes(nbKey)
      )

      expect(diff).toStrictEqual([])
    })

    it('oversettelser for bokmål inneholder alle oversettelser fra engelsk', () => {
      const nbTranslations = getTranslations('nb')
      const enTranslations = getTranslations('en')

      const diff = Object.keys(enTranslations).filter(
        (nbKey) => !Object.keys(nbTranslations).includes(nbKey)
      )

      expect(diff).toStrictEqual([])
    })

    it('returnerer sammensatte tekster med fallback på bokmål for key som ikke finnes, når locale=en', () => {
      nbMessages._commonKey = 'norsk tittel'
      nbMessages._uniqueNOKey = 'unik norsk key'
      enMessages._commonKey = 'english title'
      enMessages._uniqueENKey = 'unique english key'

      const enTranslations = getTranslations('en')
      expect(enTranslations._commonKey).toBe('english title')
      expect(enTranslations._uniqueNOKey).toBe('unik norsk key')
      expect(enTranslations._uniqueENKey).toBe('unique english key')

      delete nbMessages._commonKey
      delete nbMessages._uniqueNOKey
      delete enMessages._commonKey
      delete enMessages._uniqueENKey
    })

    it('returnerer sammensatte tekster med fallback på bokmål for key som ikke finnes, når locale=nn', () => {
      nbMessages._commonKey = 'norsk tittel'
      nbMessages._uniqueNOKey = 'unik norsk key'
      nnMessages._commonKey = 'nynorsk tittel'
      nnMessages._uniqueNNKey = 'unik nynorsk key'

      const nnTranslations = getTranslations('nn')
      expect(nnTranslations._commonKey).toBe('nynorsk tittel')
      expect(nnTranslations._uniqueNOKey).toBe('unik norsk key')
      expect(nnTranslations._uniqueNNKey).toBe('unik nynorsk key')

      delete nbMessages._commonKey
      delete nbMessages._uniqueNOKey
      delete nnMessages._commonKey
      delete nnMessages._uniqueNNKey
    })

    it('returnerer nb som default når locale er ukjent', () => {
      const defaultTranslations = getTranslations('' as unknown as Locales)
      expect(defaultTranslations['application.title']).toBe(
        'Pensjonskalkulator – Pensjon'
      )
      const unknownTranslations = getTranslations('abc' as unknown as Locales)
      expect(unknownTranslations['application.title']).toBe(
        'Pensjonskalkulator – Pensjon'
      )
    })
  })

  describe('updateLanguage', () => {
    it('setter cookie med riktig value', () => {
      const setLanguageCookieMock = vi.fn()
      expect(document.documentElement.lang).toBe('')
      updateLanguage('en', setLanguageCookieMock)
      expect(setLanguageCookieMock).toHaveBeenCalledWith('en')
      expect(document.documentElement.lang).toBe('en')
    })
  })
})
