import {
  type AlertQueryResult,
  type DynamicValues,
  getSanityPortableTextComponents,
} from '@pensjonskalkulator-frontend-monorepo/sanity'
import { PortableText } from '@portabletext/react'
import { format, parseISO } from 'date-fns'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { IntlShape, RawIntlProvider } from 'react-intl'

import { formatLeverandoerList } from '@/components/Pensjonsavtaler/OffentligTjenestePensjon/utils'
import {
  OffentligTpAlert,
  privatePensjonsavtalerAlert,
} from '@/components/Pensjonsavtaler/hooks'
import { AlertVariant } from '@/components/Simulering/hooks'
import { formatUttaksalder } from '@/utils/alder'
import { DATE_ENDUSER_FORMAT } from '@/utils/dates'

import { ALERT_TRIANGLE_ICON, INFO_SQUARE_ICON } from './constants'
import { getPdfLink, pdfFormatMessageValues } from './utils'

type SanityAlertData = Record<string, AlertQueryResult[number]>

function renderSanityAlertHtml({
  alertData,
  id,
  intl,
  dynamicValues,
}: {
  alertData: SanityAlertData
  id: string
  intl: IntlShape
  dynamicValues?: DynamicValues
}): string | null {
  const alert = alertData[id]
  if (!alert) return null

  const infoCardStatus = alert.infoCardStatus ?? alert.status ?? 'info'
  const tone =
    infoCardStatus === 'error'
      ? 'danger'
      : infoCardStatus === 'warning' || infoCardStatus === 'attention'
        ? 'warning'
        : infoCardStatus === 'success'
          ? 'success'
          : 'info'
  const icon =
    infoCardStatus === 'message' ||
    infoCardStatus === 'attention' ||
    infoCardStatus === 'tips'
      ? `<span class="pdf-sanity-alert__icon">${infoCardStatus === 'attention' ? ALERT_TRIANGLE_ICON : INFO_SQUARE_ICON}</span>`
      : ''
  const title = alert.overskrift
    ? `<h3 class="pdf-sanity-alert__title">${escapeHtml(alert.overskrift)}</h3>`
    : ''
  const content = renderToStaticMarkup(
    createElement(
      RawIntlProvider,
      { value: intl },
      createElement(PortableText, {
        value: alert.innhold,
        components: getSanityPortableTextComponents({ intl, dynamicValues }),
      })
    )
  )

  return `<section class="pdf-sanity-alert pdf-sanity-alert--${tone}${infoCardStatus === 'message' ? ' pdf-sanity-alert--message' : ''}">
  ${icon}
  <div class="pdf-sanity-alert__body">${title}${content}</div>
</section>`
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return replacements[character]
  })
}

export function getPensjonsavtalerAlertsText({
  pensjonsavtalerAlertsList,
  intl,
}: {
  pensjonsavtalerAlertsList: {
    variant: AlertVariant
    text: string
  }[]
  intl: IntlShape
}): string {
  if (!pensjonsavtalerAlertsList.length) {
    return ''
  }

  const html = pensjonsavtalerAlertsList.map((alert) => {
    const alertIcon =
      alert.variant === 'warning' ? ALERT_TRIANGLE_ICON : INFO_SQUARE_ICON
    const alertMessage = intl.formatMessage(
      { id: alert.text },
      {
        ...pdfFormatMessageValues,
        scrollTo: (chunks: string[]) =>
          getPdfLink({
            url: '',
            displayText: chunks.join('') || 'pensjonsavtaler',
          }),
      }
    )
    return renderAlertTable({ alertIcon, alertMessage })
  })

  return html.join('')
}

export function getPrivatePensjonsavtalerAlertsText({
  pensjonsavtalerAlertsList,
  intl,
}: {
  pensjonsavtalerAlertsList: privatePensjonsavtalerAlert[]
  intl: IntlShape
}): string {
  if (!pensjonsavtalerAlertsList.length) {
    return ''
  }
  const html = pensjonsavtalerAlertsList.map((alert) => {
    const heading = alert.headingId
      ? `<h4>${intl.formatMessage({ id: alert.headingId })}</h4>`
      : ''

    const alertMessage = intl.formatMessage(
      { id: alert.alertTextId },
      {
        ...pdfFormatMessageValues,
      }
    )

    const alertIcon =
      alert.variant === 'info' ? INFO_SQUARE_ICON : ALERT_TRIANGLE_ICON

    return `${heading}
    ${renderAlertTable({ alertIcon, alertMessage })}`
  })

  return html.join('')
}

export function getOffentligTjenestePensjonAlertsText({
  offentligTpAlertsList,
  offentligTp,
  intl,
}: {
  offentligTpAlertsList: OffentligTpAlert[]
  offentligTp?: OffentligTpResponse
  intl: IntlShape
}): string {
  if (!offentligTpAlertsList.length) {
    return ''
  }
  const html = offentligTpAlertsList.map((alert) => {
    const leverandoerList = offentligTp?.muligeTpLeverandoerListe
    const chunk =
      alert.hasLeverandoerList && leverandoerList?.length
        ? formatLeverandoerList(intl.locale, leverandoerList)
        : undefined

    const heading = `<h4>${intl.formatMessage({ id: 'pensjonsavtaler.offentligtp.title' })}</h4>`
    const alertIcon =
      alert.variant === 'info' ? INFO_SQUARE_ICON : ALERT_TRIANGLE_ICON
    const alertMessage = intl.formatMessage(
      { id: alert.alertTextId },
      {
        ...pdfFormatMessageValues,
        chunk: chunk ? `(${chunk})` : '',
      }
    )
    return `${heading}
      ${renderAlertTable({ alertIcon, alertMessage })}`
  })

  return html.join('')
}

export function getAfpOffentligAlertsText({
  afpOffentligAlertsList,
  intl,
}: {
  afpOffentligAlertsList: {
    variant: AlertVariant
    text: string
  }
  intl: IntlShape
}): string {
  if (
    afpOffentligAlertsList.text ===
    'beregning.alert.info.afp-offentlig-livsvarig'
  ) {
    return ''
  }
  const alertIcon =
    afpOffentligAlertsList.variant === 'info'
      ? INFO_SQUARE_ICON
      : ALERT_TRIANGLE_ICON
  const alertMessage = intl.formatMessage(
    { id: afpOffentligAlertsList.text },
    {
      ...pdfFormatMessageValues,
    }
  )
  return renderAlertTable({ alertIcon, alertMessage })
}

export function getApotekerAlert(
  intl: IntlShape,
  alertData: SanityAlertData
): string {
  const alertMessage = renderSanityAlertHtml({
    alertData,
    id: 'apoteker.beregning-med-afp-feil',
    intl,
  })

  return alertMessage ?? ''
}

export function getOmstillingsstoenadAlert(
  intl: IntlShape,
  normertPensjonsalder: Alder
): string {
  const formatertNormertPensjonsalder = formatUttaksalder(
    intl,
    normertPensjonsalder
  )
  const telefonNummer = intl.formatMessage({ id: 'link.telefon_pensjon' })
  const linkHtml = `<span>${telefonNummer}</span>`

  const alertMessage = intl.formatMessage(
    { id: 'tidligstmuliguttak.info_omstillingsstoenad_og_gjenlevende' },
    {
      ...pdfFormatMessageValues,
      normertPensjonsalder: formatertNormertPensjonsalder,
      link: linkHtml,
    }
  )

  return renderAlertTable({ alertIcon: INFO_SQUARE_ICON, alertMessage })
}

export const getFremtidigVedtakAlert = ({
  loependeVedtak,
  intl,
  alertData,
}: {
  loependeVedtak: LoependeVedtak
  intl: IntlShape
  alertData: SanityAlertData
}): string | null => {
  if (!loependeVedtak.fremtidigAlderspensjon || loependeVedtak.alderspensjon)
    return null

  const alertMessage = renderSanityAlertHtml({
    alertData,
    id: 'start.fremtidig-vedtak-uten-gjeldende',
    intl,
    dynamicValues: {
      grad: loependeVedtak.fremtidigAlderspensjon.grad,
      vedtakDato: format(
        parseISO(loependeVedtak.fremtidigAlderspensjon.fom),
        DATE_ENDUSER_FORMAT
      ),
    },
  })
  if (!alertMessage) return null

  return alertMessage
}

function renderAlertTable({
  alertIcon,
  alertMessage,
}: {
  alertIcon: string
  alertMessage: string
}): string {
  return `<table role='presentation' class='alert-box' style='width: 100%; margin-bottom: 1em;'>
    <tr>
      <td style='width: 20px; vertical-align: top; padding: 16px 8px 16px 16px; margin: 0; border: none;'>
        <span class='infoIconContainer'>
          ${alertIcon}
        </span>
      </td>
      <td style='vertical-align: top; padding: 16px 16px 16px 8px; margin: 0; text-align: left; border: none;'>
        <p style='margin: 0; padding: 0;'>${alertMessage}</p>
      </td>
    </tr>
  </table>`
}
