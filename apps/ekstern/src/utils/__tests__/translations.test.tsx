import { FormattedMessage, IntlShape } from 'react-intl'

import { describe, expect, it } from 'vitest'

import { getFormatMessageValues } from '../translations'
import { externalUrls } from '@/router/constants'
import { render, screen } from '@/test-utils'

describe('translations-utils', () => {
  describe('formatMessageValues', async () => {
    const intlMock = {
      formatMessage: (s: { id: string }) => s.id,
    } as unknown as IntlShape

    it('formaterer <detaljertKalkulatorLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.detaljertKalkulatorLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()
      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        externalUrls.detaljertKalkulator
      )
      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <dinPensjonLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.dinPensjonLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()
      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        'https://nav.no/pensjon'
      )
      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <dinPensjonBeholdningLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.dinPensjonBeholdningLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()
      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        'https://www.nav.no/pensjon/opptjening/nb/'
      )
      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <dinPensjonEndreSoeknadLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.dinPensjonEndreSoeknadLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()
      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        'https://www.nav.no/pensjon/selvbetjening/alderspensjon/endringssoknad'
      )
      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <alderspensjonsreglerLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.alderspensjonsreglerLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()
      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        'https://www.nav.no/alderspensjon#beregning'
      )
      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <garantiPensjonLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.garantiPensjonLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()
      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        'https://www.nav.no/minstepensjon'
      )
      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <afpLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.afpLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()
      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        'https://www.afp.no'
      )
      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <afpPrivatLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.afpPrivatLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()
      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        'https://www.nav.no/afp-i-privat-sektor'
      )
      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <norskPensjonLink> med riktig url og uten ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.norskPensjonLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()
      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        'https://norskpensjon.no/'
      )
      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <navPersonvernerklaeringLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.navPersonvernerklaeringLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()

      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()

      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        externalUrls.personvernerklaering
      )

      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <navPersonvernerklaeringKontaktOssLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.navPersonvernerklaeringKontaktOssLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()

      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()

      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        externalUrls.personvernerklaeringKontaktOss
      )

      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <kontaktOssLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.kontaktOssLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()

      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()

      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        externalUrls.kontaktOss
      )

      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <planleggePensjonLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.planleggePensjonLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()

      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()

      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        externalUrls.planleggePensjon
      )

      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <trygdetidLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.trygdetidLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()

      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()

      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        externalUrls.trygdetid
      )

      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <kortBotidLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.kortBotidLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()

      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()

      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        externalUrls.kortBotid
      )

      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <personopplysningerLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.personopplysningerLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()

      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()

      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        externalUrls.personopplysninger
      )

      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <spkLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.spkLink"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(
        screen.getByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()

      expect(screen.getByText('my link', { exact: false })).toBeInTheDocument()

      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        externalUrls.personopplysninger
      )

      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer {br} til <br/>', async () => {
      const { asFragment } = render(
        <FormattedMessage
          id="translation.test.br"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(asFragment()).toMatchSnapshot()
    })

    it('formaterer <strong>', async () => {
      const { asFragment } = render(
        <FormattedMessage
          id="translation.test.strong"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(asFragment()).toMatchSnapshot()
    })

    it('formaterer <nowrap>', async () => {
      const { asFragment } = render(
        <FormattedMessage
          id="translation.test.nowrap"
          values={{ ...getFormatMessageValues(intlMock) }}
        />
      )
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
