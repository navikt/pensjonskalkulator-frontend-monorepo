import sanityAlertDataResponse from '@pensjonskalkulator-frontend-monorepo/mocks/data/sanity-alert-data.json' with { type: 'json' }
import type { AlertQueryResult } from '@pensjonskalkulator-frontend-monorepo/sanity'
import { createIntl } from 'react-intl'
import { describe, expect, it } from 'vitest'

import {
  getOffentligTjenestePensjonAlertsText,
  getOmstillingsstoenadAlert,
  getPensjonsavtalerAlertsText,
  getPrivatePensjonsavtalerAlertsText,
} from '../alerts'

const alertData = Object.fromEntries(
  sanityAlertDataResponse.result.map((alert) => [alert.name, alert])
) as unknown as Record<string, AlertQueryResult[number]>

describe('PDF Sanity alerts', () => {
  it('renders the omstillingsstønad alert from Sanity', () => {
    const html = getOmstillingsstoenadAlert(
      createIntl({ locale: 'nb', messages: {} }),
      alertData
    )

    expect(html).toContain('pdf-sanity-alert--info')
    expect(html).toContain('pdf-sanity-alert--message')
    expect(html).not.toContain('pdf-sanity-alert__title')
    expect(html).toContain(
      'Alderspensjon kan ikke kombineres med gjenlevendepensjon eller omstillingsstønad'
    )
    expect(html).toContain('55 55 33 34')
    expect(html).toContain('href="tel:')
  })

  it('renders the unsupported public pension alert from Sanity', () => {
    const html = getPensjonsavtalerAlertsText({
      alertData,
      intl: createIntl({ locale: 'nb', messages: {} }),
      pensjonsavtalerAlertsList: [
        {
          variant: 'info',
          sanityId: 'pensjonsavtaler.kan-ha-rett-til-offentlig-tp',
        },
      ],
    })

    expect(html).toContain('(WIP) Kan ha rett til offentlig tjenestepensjon')
    expect(html).toContain('Les mer under pensjon fra andre.')
  })

  it('renders the public pension retrieval error from Sanity', () => {
    const html = getPensjonsavtalerAlertsText({
      alertData,
      intl: createIntl({ locale: 'nb', messages: {} }),
      pensjonsavtalerAlertsList: [
        {
          variant: 'warning',
          sanityId: 'pensjonsavtaler.noe-gikk-galt-ved-henting-offentlig',
        },
      ],
    })

    expect(html).toContain('pdf-sanity-alert--warning')
    expect(html).toContain('(WIP) Pensjon fra andre')
    expect(html).toContain(
      'Noe gikk galt ved henting av pensjonsavtaler i offentlig sektor'
    )
  })

  it('renders the pre-1963 AFP calculation failure from Sanity', () => {
    const html = getPensjonsavtalerAlertsText({
      alertData,
      intl: createIntl({
        locale: 'nb',
        messages: {
          'application.global.external_link': 'åpner i en ny fane',
        },
      }),
      pensjonsavtalerAlertsList: [
        {
          variant: 'warning',
          sanityId: 'afp.fikk-ikke-hentet-beregning-fra-spk',
        },
      ],
    })

    expect(html).toContain('pdf-sanity-alert--warning')
    expect(html).toContain('Vi fikk ikke hentet beregning av AFP fra SPK')
    expect(html).toContain('https://www.spk.no/')
  })

  it.each([
    {
      sanityId: 'pensjonsavtaler.noe-gikk-galt-ved-henting-privat',
      content: 'Noe gikk galt ved henting av pensjonsavtaler i privat sektor',
    },
    {
      sanityId: 'pensjonsavtaler.noe-gikk-galt-ved-henting-offentlig-og-privat',
      content:
        'Noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor',
    },
  ])('renders $sanityId from Sanity', ({ sanityId, content }) => {
    const html = getPensjonsavtalerAlertsText({
      alertData,
      intl: createIntl({ locale: 'nb', messages: {} }),
      pensjonsavtalerAlertsList: [{ variant: 'warning', sanityId }],
    })

    expect(html).toContain('pdf-sanity-alert--warning')
    expect(html).toContain(content)
  })

  it('renders the private empty-agreements message from Sanity', () => {
    const html = getPrivatePensjonsavtalerAlertsText({
      alertData,
      intl: createIntl({
        locale: 'nb',
        messages: {
          'pensjonsavtaler.private.title.ingen': 'Private pensjonsavtaler',
        },
      }),
      pensjonsavtalerAlertsList: [
        {
          variant: 'info',
          sanityId: 'pensjonsavtaler.fant-ingen-private',
          headingId: 'pensjonsavtaler.private.title.ingen',
        },
      ],
    })

    expect(html).toContain('Vi fant ingen pensjonsavtaler.')
    expect(html).not.toContain('pdf-sanity-alert__title')
  })

  it('renders the public empty-agreements message from Sanity', () => {
    const html = getOffentligTjenestePensjonAlertsText({
      alertData,
      intl: createIntl({
        locale: 'nb',
        messages: {
          'pensjonsavtaler.offentligtp.title': 'Offentlig tjenestepensjon',
        },
      }),
      offentligTpAlertsList: [
        {
          status: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          variant: 'info',
          sanityId: 'pensjonsavtaler.fant-ingen-offentlige',
          hasLeverandoerList: false,
          logTekst: 'Fant ingen offentlige pensjonsavtaler',
        },
      ],
    })

    expect(html).toContain('Vi fant ingen pensjonsavtaler.')
    expect(html).not.toContain('pdf-sanity-alert__title')
  })

  it.each([
    {
      sanityId: 'pensjonsavtaler.starter-foer-valgt-alder',
      content: 'Du har pensjonsavtaler som starter før valgt alder.',
    },
    {
      sanityId: 'pensjonsavtaler.avtaler-ikke-med-i-beregning',
      content:
        'Pensjonsavtaler fra arbeidsgivere og egen sparing er ikke med i beregningen.',
    },
  ])('renders $sanityId from Sanity', ({ sanityId, content }) => {
    const html = getPensjonsavtalerAlertsText({
      alertData,
      intl: createIntl({ locale: 'nb', messages: {} }),
      pensjonsavtalerAlertsList: [{ variant: 'info', sanityId }],
    })

    expect(html).toContain(content)
    expect(html).toContain('pdf-sanity-alert__icon')
    expect(html).not.toContain('pdf-sanity-alert__title')
  })
})
