import { describe, it } from 'vitest'

import { render } from '@/test-utils'

import { Divider } from '..'

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
