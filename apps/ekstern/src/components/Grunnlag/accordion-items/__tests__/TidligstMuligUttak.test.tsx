import { screen } from '@testing-library/react'

import { TidligstMuligUttak } from '../TidligstMuligUttak'
import { render } from '@/test-utils'

describe('TidligstMuligUttak', () => {
  it('rendrer med år og måned', () => {
    render(<TidligstMuligUttak uttaksalder={{ aar: 62, maaned: 10 }} />)

    expect(screen.getByText('62 år, 10 md.')).toBeVisible()
  })

  it('rendrer med år og uten måned', () => {
    render(<TidligstMuligUttak uttaksalder={{ aar: 62, maaned: 0 }} />)

    expect(screen.getByText('62 år')).toBeVisible()
  })
})
