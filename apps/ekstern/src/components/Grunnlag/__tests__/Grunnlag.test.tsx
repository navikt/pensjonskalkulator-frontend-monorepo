import { vi } from 'vitest'

import { Grunnlag } from '@/components/Grunnlag'
import * as velgUttaksalderUtils from '@/components/VelgUttaksalder/utils'
import { render, screen, userEvent } from '@/test-utils'

describe('Grunnlag', () => {
  it('viser alle seksjonene', async () => {
    const { asFragment } = render(<Grunnlag />)

    expect(
      await screen.findByText('Grunnlaget for beregningen')
    ).toBeInTheDocument()
    expect(await screen.findByText('Tidligst mulig uttak:')).toBeVisible()
    expect(await screen.findByText('Uttaksgrad:')).toBeVisible()
    expect(await screen.findByText('Inntekt:')).toBeVisible()
    expect(await screen.findByText('Sivilstand:')).toBeVisible()
    expect(await screen.findByText('Utenlandsopphold:')).toBeVisible()
    expect(await screen.findByText('Alderspensjon (NAV):')).toBeVisible()
    expect(await screen.findByText('AFP')).toBeVisible()
    expect(await screen.findByText('Pensjonsavtaler:')).toBeVisible()

    expect(asFragment()).toMatchSnapshot()
  })

  describe('Grunnlag - tidligst mulig uttak', () => {
    it('rendrer riktig tittel med formatert uttaksalder og tekst', async () => {
      const user = userEvent.setup()
      const formatMock = vi.spyOn(velgUttaksalderUtils, 'formatUttaksalder')
      render(<Grunnlag tidligstMuligUttak={{ aar: 67, maaned: 1 }} />)
      expect(screen.getByText('Tidligst mulig uttak:')).toBeVisible()
      expect(formatMock).toHaveBeenCalled()
      const buttons = screen.getAllByRole('button')
      await user.click(buttons[0])
      expect(await screen.findByText('67 år')).toBeVisible()
    })

    it('rendrer riktig når tidligst mulig uttaksalder ikke kunne hentes', async () => {
      const user = userEvent.setup()
      const formatMock = vi.spyOn(velgUttaksalderUtils, 'formatUttaksalder')
      render(<Grunnlag />)
      expect(screen.getByText('Tidligst mulig uttak:')).toBeVisible()
      expect(await screen.findByText('Ikke funnet')).toBeVisible()
      const buttons = screen.getAllByRole('button')
      await user.click(buttons[0])
      expect(
        screen.getByText(
          'Vi klarte ikke å finne tidspunkt for når du tidligst kan ta ut alderspensjon. Prøv igjen senere.'
        )
      ).toBeVisible()
      expect(formatMock).not.toHaveBeenCalled()
    })
  })
})
