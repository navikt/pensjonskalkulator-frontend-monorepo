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

    it('formaterer <navPersonvernerklaeringKontaktOss> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.navPersonvernerklaeringKontaktOss"
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
