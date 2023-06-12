import { Pensjonsavtaler } from '../Pensjonsavtaler'
import { render, screen } from '@/test-utils'

describe('Pensjonsavtaler', () => {
  it('rendrer ingenting om avtalelisten er tom', () => {
    render(<Pensjonsavtaler pensjonsavtaler={[]} />)

    expect(
      screen.queryByText('Pensjonsavtaler', { exact: false })
    ).not.toBeInTheDocument()
  })

  it('rendrer riktig med avtaler som bare har start dato', () => {
    const { asFragment } = render(
      <Pensjonsavtaler
        pensjonsavtaler={[
          {
            navn: 'DNB',
            type: 'privat tjenestepensjon',
            startAar: 67,
            startMaaned: 1,
            grad: 100,
            beholdning: 12345,
          },
        ]}
      />
    )
    expect(
      screen.queryByText('Pensjonsavtaler', { exact: false })
    ).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer riktig med avtaler som har både start- og sluttdato', () => {
    const { asFragment } = render(
      <Pensjonsavtaler
        pensjonsavtaler={[
          {
            navn: 'DNB',
            type: 'privat tjenestepensjon',
            startAar: 67,
            startMaaned: 1,
            sluttAar: 77,
            sluttMaaned: 8,
            grad: 100,
            beholdning: 12345,
          },
        ]}
      />
    )
    expect(
      screen.queryByText('Pensjonsavtaler', { exact: false })
    ).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})
