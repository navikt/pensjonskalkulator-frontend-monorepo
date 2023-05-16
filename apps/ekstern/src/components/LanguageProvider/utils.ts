import { getTranslation_en } from '@/translations/en'
import { getTranslation_nb } from '@/translations/nb'
import { getTranslation_nn } from '@/translations/nn'

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

export function getTranslations(locale: string): Record<string, string> {
  let messages = getTranslation_nb()
  if (locale === 'en') {
    messages = { ...messages, ...getTranslation_en() }
  } else if (locale === 'nn') {
    messages = { ...messages, ...getTranslation_nn() }
  }
  return messages
}
