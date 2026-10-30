import sanityAlertDataResponse from '@pensjonskalkulator-frontend-monorepo/mocks/data/sanity-alert-data.json' with { type: 'json' }
import { type AlertQueryResult } from '@pensjonskalkulator-frontend-monorepo/sanity'
import { createIntl } from 'react-intl'
import { describe, expect, it } from 'vitest'

import nb from '@/translations/nb'

import {
  getAfpOffentligAlertsText,
  getOffentligTjenestePensjonAlertsText,
  getOmstillingsstoenadAlert,
  getPensjonsavtalerAlertsText,
  getPrivatePensjonsavtalerAlertsText,
} from '../alerts'
import { PRINT_STYLES } from '../printStyles'

const alertData = Object.fromEntries(
  sanityAlertDataResponse.result.map((alert) => [alert.name, alert])
) as unknown as Record<string, AlertQueryResult[number]>

describe('PDF Sanity alerts', () => {
  it.each([
    {
      sanityId: 'afp.klarte-ikke-hente-beløp-livsvarig',
      text: 'beregning.alert.success.afp-offentlig-livsvarig',
      content: 'Prøv igjen senere.',
    },
    {
      sanityId: 'afp.klarte-ikke-sjekke-livsvarig',
      text: 'beregning.alert.feil.afp-offentlig-livsvarig',
      content: 'Vi klarte ikke å sjekke om du har AFP',
    },
    {
      sanityId: 'afp.beloep-vises-ikke',
      text: 'beregning.alert.info.afp-offentlig-livsvarig',
      content:
        'Vi har hentet din livsvarige AFP. Beløpet vises ikke i graf og tabell.',
    },
  ])(
    'renders AFP alert $sanityId from Sanity',
    ({ sanityId, text, content }) => {
      const html = getAfpOffentligAlertsText({
        afpOffentligAlertsList: {
          variant: 'warning',
          text,
          sanityId,
        },
        intl: createIntl({ locale: 'nb', messages: {} }),
        alertData,
      })

      expect(html).toContain(content)
      expect(html).toContain(
        sanityId === 'afp.beloep-vises-ikke'
          ? 'pdf-sanity-alert--info'
          : 'pdf-sanity-alert--warning'
      )
    }
  )

  it.each([
    { alder: { aar: 70, maaneder: 0 }, formatertAlder: '70 år' },
    { alder: { aar: 68, maaneder: 1 }, formatertAlder: '68 år og 1 måned' },
  ])(
    'renders the omstillingsstønad alert with normert age $formatertAlder',
    ({ alder, formatertAlder }) => {
      const html = getOmstillingsstoenadAlert(
        createIntl({ locale: 'nb', messages: nb }),
        alertData,
        alder
      )

      expect(html).toContain('pdf-sanity-alert--info')
      expect(html).toContain('pdf-sanity-alert--message')
      expect(html).not.toContain('pdf-sanity-alert__title')
      expect(html).toContain(
        'Alderspensjon kan ikke kombineres med gjenlevendepensjon eller omstillingsstønad'
      )
      expect(html).toContain('55 55 33 34')
      expect(html).toContain('href="tel:')
      expect(html).toContain(formatertAlder)
      expect(html).not.toContain('67 år')
      expect(html).not.toContain('{normertPensjoneringsalder}')
    }
  )

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

    expect(html).toContain(
      'Beregningen viser kanskje ikke alt. Du kan ha rett til offentlig tjenestepensjon.'
    )
    expect(html).not.toContain('pdf-sanity-alert__title')
    expect(html).toContain('href="#pensjonsavtaler-heading"')
    expect(html).toContain('>pensjon fra andre</a>')
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
    expect(html).toContain(
      '<span class="pdf-sanity-alert__icon"><svg width="17" height="16"'
    )
    expect(html).toContain(
      '<h3 class="pdf-sanity-alert__title">Pensjon fra andre</h3>'
    )
    expect(html).toContain(
      'Noe gikk galt ved henting av pensjonsavtaler i offentlig sektor'
    )
  })

  it('uses the status and heading for non-InfoCard Sanity alerts', () => {
    const html = getPensjonsavtalerAlertsText({
      alertData: {
        ...alertData,
        'afp.fikk-ikke-hentet-beregning-fra-spk': {
          ...alertData['afp.fikk-ikke-hentet-beregning-fra-spk'],
          infoCardStatus: 'message',
        },
      },
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
    expect(html).not.toContain('pdf-sanity-alert--message')
    expect(html).toContain('Vi fikk ikke hentet beregning av AFP fra SPK')
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
    expect(PRINT_STYLES).toContain(
      '.pdf-sanity-alert__body a { color: inherit; text-decoration: none; }'
    )
    expect(PRINT_STYLES).toContain(
      '.pdf-sanity-alert__body a svg { display: none; }'
    )
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
    expect(html).toContain(
      '<span class="pdf-sanity-alert__icon"><svg width="17" height="16"'
    )
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

  it('renders the missing public TP response alert with a warning icon', () => {
    const html = getOffentligTjenestePensjonAlertsText({
      alertData,
      intl: createIntl({
        locale: 'nb',
        messages: {
          'pensjonsavtaler.offentligtp.title': 'Offentlig tjenestepensjon',
        },
      }),
      offentligTp: {
        simuleringsresultatStatus: 'TOM_SIMULERING_FRA_TP_ORDNING',
        muligeTpLeverandoerListe: [],
      },
      offentligTpAlertsList: [
        {
          status: 'TOM_SIMULERING_FRA_TP_ORDNING',
          variant: 'warning',
          sanityId: 'pensjonsavtaler.fikk-ikke-svar.offentlig',
          hasLeverandoerList: false,
          logTekst: '',
        },
      ],
    })

    expect(html).toContain('pdf-sanity-alert--warning')
    expect(html).toContain(
      '<span class="pdf-sanity-alert__icon"><svg width="17" height="16"'
    )
    expect(html).toContain(
      'Vi fikk ikke svar fra din offentlige tjenestepensjonsordning.'
    )
  })

  it.each([
    {
      status: 'TP_ORDNING_STOETTES_IKKE',
      sanityId: 'pensjonsavtaler.kan-ikke-hente-alle-offentlige',
    },
    {
      status: 'TEKNISK_FEIL',
      sanityId: 'pensjonsavtaler.klarte-ikke-hente-offentlig-tjenestepensjon',
    },
  ] as const)(
    'renders TP scheme dynamic value in $sanityId',
    ({ status, sanityId }) => {
      const html = getOffentligTjenestePensjonAlertsText({
        alertData,
        intl: createIntl({
          locale: 'nb',
          messages: {
            'pensjonsavtaler.offentligtp.title': 'Offentlig tjenestepensjon',
          },
        }),
        offentligTp: {
          simuleringsresultatStatus: status,
          muligeTpLeverandoerListe: ['KLP'],
        },
        offentligTpAlertsList: [
          {
            status,
            variant: 'warning',
            sanityId,
            hasLeverandoerList: true,
            logTekst: '',
          },
        ],
      })

      expect(html).toContain('KLP')
      expect(html).not.toContain('<TP-ordning>')
    }
  )

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
