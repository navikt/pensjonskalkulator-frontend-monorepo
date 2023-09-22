import { FormattedMessage } from 'react-intl'

import { describe, expect, it } from 'vitest'

import { formatMessageValues } from '../translations'
import { render, screen } from '@/test-utils'

describe('translations-utils', () => {
  describe('formatMessageValues', async () => {
    it('formaterer <detaljertKalkulatorLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.detaljertKalkulatorLink"
          values={{ ...formatMessageValues }}
        />
      )
      expect(
        screen.queryByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(
        screen.queryByText('my link', { exact: false })
      ).toBeInTheDocument()
      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        'https://www.nav.no/pselv/simulering.jsf'
      )
      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <dinPensjonLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.dinPensjonLink"
          values={{ ...formatMessageValues }}
        />
      )
      expect(
        screen.queryByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(
        screen.queryByText('my link', { exact: false })
      ).toBeInTheDocument()
      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        'https://nav.no/pensjon'
      )
      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer <alderspensjonsreglerLink> med riktig url og ikon', async () => {
      render(
        <FormattedMessage
          id="translation.test.alderspensjonsreglerLink"
          values={{ ...formatMessageValues }}
        />
      )
      expect(
        screen.queryByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(
        screen.queryByText('my link', { exact: false })
      ).toBeInTheDocument()
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
          values={{ ...formatMessageValues }}
        />
      )
      expect(
        screen.queryByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(
        screen.queryByText('my link', { exact: false })
      ).toBeInTheDocument()
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
          values={{ ...formatMessageValues }}
        />
      )
      expect(
        screen.queryByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(
        screen.queryByText('my link', { exact: false })
      ).toBeInTheDocument()
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
          values={{ ...formatMessageValues }}
        />
      )
      expect(
        screen.queryByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(
        screen.queryByText('my link', { exact: false })
      ).toBeInTheDocument()
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
          values={{ ...formatMessageValues }}
        />
      )
      expect(
        screen.queryByText('lorem ipsum dolor', { exact: false })
      ).toBeInTheDocument()
      expect(
        screen.queryByText('my link', { exact: false })
      ).toBeInTheDocument()
      expect(screen.queryByRole('link')).toHaveAttribute(
        'href',
        'https://norskpensjon.no/'
      )
      expect(
        await screen.findByRole('img', { hidden: true })
      ).toBeInTheDocument()
    })

    it('formaterer {br} til <br/>', async () => {
      const { asFragment } = render(
        <FormattedMessage
          id="translation.test.br"
          values={{ ...formatMessageValues }}
        />
      )
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
