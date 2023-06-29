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
            produktbetegnelse: 'DNB',
            kategori: 'privat tjenestepensjon',
            startAlder: 67,
            startMaaned: 1,
            utbetalingsperiode: {
              startAlder: 67,
              startMaaned: 1,
              aarligUtbetaling: 12345,
              grad: 100,
            },
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
            produktbetegnelse: 'DNB',
            kategori: 'privat tjenestepensjon',
            startAlder: 67,
            startMaaned: 1,
            utbetalingsperiode: {
              startAlder: 67,
              startMaaned: 1,
              sluttAlder: 77,
              sluttMaaned: 8,
              aarligUtbetaling: 12345,
              grad: 100,
            },
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
