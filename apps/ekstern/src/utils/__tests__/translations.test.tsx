import { FormattedMessage } from 'react-intl'
import { describe, expect, it } from 'vitest'

import { render, screen } from '@/test-utils'

import { externalLinks, getFormatMessageValues } from '../translations'

const tagToExpectedLink: Record<
  `${(typeof externalLinks)[number]}Link`,
  string
> = {
  detaljertKalkulatorLink: '/pensjon/kalkulator/redirect/detaljert-kalkulator',
  dinPensjonBeholdningLink: 'https://www.nav.no/pensjon/opptjening/nb/',
  dinPensjonEndreSoeknadLink:
    'https://www.nav.no/pensjon/selvbetjening/alderspensjon/endringssoknad',
  alderspensjonsreglerLink: 'https://www.nav.no/alderspensjon#beregning',
  garantiPensjonLink: 'https://www.nav.no/minstepensjon',
  afpLink: 'https://www.afp.no',
  afpPrivatLink: 'https://www.nav.no/afp-i-privat-sektor',
  norskPensjonLink: 'https://norskpensjon.no/',
  navPersonvernerklaeringLink:
    'https://www.nav.no/personvernerklaering#dine-rettigheter',
  navPersonvernerklaeringKontaktOssLink:
    'https://www.nav.no/personvernerklaering#kontakt-nav',
  kontaktOssLink: 'https://www.nav.no/kontaktoss',
  planleggePensjonLink:
    'https://www.nav.no/planlegger-pensjon#noe-du-ikke-finner-svaret-p-her',
  trygdetidLink:
    'https://www.nav.no/no/person/flere-tema/arbeid-og-opphold-i-norge/relatert-informasjon/medlemskap-i-folketrygden',
  kortBotidLink: 'https://www.nav.no/alderspensjon#kort-botid',
  ufoeretrygdOgAfpLink: 'https://www.nav.no/ufor-til-pensjon#afp',
  personopplysningerLink:
    'https://www.nav.no/personopplysninger-i-pensjonskalkulator',
  spkLink: 'https://www.spk.no/',
  klpLink: 'https://www.klp.no/',
}

describe('translations-utils', () => {
  describe('formatMessageValues', async () => {
    Object.entries(tagToExpectedLink).forEach(([tag, expectedUrl]) => {
      it(`formaterer <${tag}> med riktig url og ikon`, async () => {
        render(
          <FormattedMessage
            id={`translation.test.${tag}`}
            values={{ ...getFormatMessageValues() }}
          />
        )
        expect(
          screen.getByText('lorem ipsum dolor', { exact: false })
        ).toBeInTheDocument()
        expect(
          screen.getByText('my link', { exact: false, selector: 'a' })
        ).toBeInTheDocument()
        expect(screen.queryByRole('link')).toHaveAttribute('href', expectedUrl)
        expect(
          await screen.findByRole('img', { hidden: true })
        ).toBeInTheDocument()
      })
    })

    it('formaterer {br} til <br/>', async () => {
      render(
        <FormattedMessage
          id="translation.test.br"
          values={{ ...getFormatMessageValues() }}
        />
      )
      const brElement = document.querySelector('br')
      expect(brElement).toBeInTheDocument()
    })

    it('formaterer <strong>', async () => {
      render(
        <FormattedMessage
          id="translation.test.strong"
          values={{ ...getFormatMessageValues() }}
        />
      )

      const strongElement = document.querySelector('strong')
      expect(strongElement).toBeInTheDocument()
      expect(strongElement).toHaveTextContent('ipsum')
    })

    it('formaterer <nowrap>', async () => {
      render(
        <FormattedMessage
          id="translation.test.nowrap"
          values={{ ...getFormatMessageValues() }}
        />
      )
      const nowrapElement = document.querySelector('span.nowrap')
      expect(nowrapElement).toBeInTheDocument()
      expect(nowrapElement).toHaveClass('nowrap')
      expect(nowrapElement).toHaveTextContent('ipsum')
    })
  })
})
