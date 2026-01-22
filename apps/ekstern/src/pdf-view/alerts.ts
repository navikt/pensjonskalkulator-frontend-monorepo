import { format, parseISO } from 'date-fns'
import { IntlShape } from 'react-intl/src/types'

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

export function getApotekerAlert(intl: IntlShape): string {
  const alertMessage = intl.formatMessage(
    { id: 'error.apoteker_warning' },
    {
      ...pdfFormatMessageValues,
    }
  )

  return renderAlertTable({ alertIcon: ALERT_TRIANGLE_ICON, alertMessage })
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
}: {
  loependeVedtak: LoependeVedtak
  intl: IntlShape
}): string | null => {
  if (!loependeVedtak.fremtidigAlderspensjon || loependeVedtak.alderspensjon)
    return null

  const alertMessage = intl.formatMessage(
    { id: 'stegvisning.fremtidigvedtak.alert' },
    {
      ...pdfFormatMessageValues,
      grad: loependeVedtak.fremtidigAlderspensjon.grad,
      fom: format(
        parseISO(loependeVedtak.fremtidigAlderspensjon.fom),
        DATE_ENDUSER_FORMAT
      ),
    }
  )

  return renderAlertTable({ alertMessage, alertIcon: INFO_SQUARE_ICON })
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
