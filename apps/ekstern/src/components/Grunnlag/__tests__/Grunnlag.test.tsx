import { Grunnlag } from '@/components/Grunnlag'
import { render, screen } from '@/test-utils'

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
})
