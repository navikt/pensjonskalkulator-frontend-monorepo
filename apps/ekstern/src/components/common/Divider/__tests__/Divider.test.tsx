import { describe, it } from 'vitest'

import { Divider } from '..'
import { render } from '@/test-utils'

describe('Divider', () => {
  it('rendrer riktig med default verdier', () => {
    const { asFragment } = render(<Divider />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer riktig uten margin', () => {
    const { asFragment } = render(<Divider noMargin />)
    expect(asFragment()).toMatchSnapshot()
  })
})
