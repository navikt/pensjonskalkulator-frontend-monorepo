import { format } from 'date-fns'

import { DATE_ENDUSER_FORMAT } from '@/utils/dates'

export const getCurrentDateTimeFormatted = (): string => {
  const now = new Date()

  const date = format(now, DATE_ENDUSER_FORMAT)
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')

  return `${date}, kl. ${hours}.${minutes}`
}

export const getPdfLink = ({
  url,
  displayText,
}: {
  url?: string
  displayText: string
}): string => {
  if (!url) return displayText
  return `<a href="${url}" style="color: #23262A">${displayText}</a><span style="text-decoration: underline"> (${url.substring(8)})</span>`
}

export const escapeHtml = (input: string): string => {
  if (input === null || input === undefined) return ''
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const pdfFormatMessageValues = {
  br: '<br/>',
  strong: (chunks: string[]) => `<strong>${chunks.join('')}</strong>`,
  nowrap: (chunks: string[]) =>
    `<span class="nowrap">${chunks.join('')}</span>`,
}
