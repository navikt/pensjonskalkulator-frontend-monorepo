import translations_en from '@/translations/en'
import translations_nb from '@/translations/nb'
import translations_nn from '@/translations/nn'

export function setCookie(
  name: string,
  value: string,
  days = 7,
  path = '/'
): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie =
    name +
    '=' +
    encodeURIComponent(value) +
    '; expires=' +
    expires +
    '; path=' +
    path
}

export function getCookie(name: string): string {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=')
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, '')
}

export function getSelectedLanguage(): Locales {
  return (getCookie('decorator-language') as Locales) || 'nb'
}

export function getTranslations(locale: Locales): Record<string, string> {
  if (locale === 'en') {
    return { ...translations_nb, ...translations_en }
  } else if (locale === 'nn') {
    return { ...translations_nb, ...translations_nn }
  }
  return translations_nb
}

export function updateLanguage(
  languageLocale: Locales,
  setLanguageCookie: React.Dispatch<React.SetStateAction<Locales>>
) {
  setLanguageCookie(languageLocale)
  document.documentElement.setAttribute('lang', languageLocale)
}
