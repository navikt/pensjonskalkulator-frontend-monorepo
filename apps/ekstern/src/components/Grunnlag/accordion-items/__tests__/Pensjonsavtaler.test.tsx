import { screen } from '@testing-library/react'

import { Pensjonsavtaler } from '../Pensjonsavtaler'
import { render } from '@/test-utils'

describe('Pensjonsavtaler', () => {
  it('rendrer', () => {
    render(
      <Pensjonsavtaler
        pensjonsavtaler={[
          {
            type: 'privat tjenestepensjon',
            fra: 'DNB',
            utbetalesFraAlder: 67,
            utbetalesTilAlder: 77,
            aarligUtbetaling: 12345,
          },
        ]}
      />
    )

    expect(
      screen.queryByText('Pensjonsavtaler', { exact: false })
    ).toBeVisible()
  })

  it('rendrer ingenting om avtalelisten er tom', () => {
    render(<Pensjonsavtaler pensjonsavtaler={[]} />)

    expect(
      screen.queryByText('Pensjonsavtaler', { exact: false })
    ).not.toBeInTheDocument()
  })
})
