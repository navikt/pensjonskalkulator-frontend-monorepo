import { describe, it } from 'vitest'

import { ResponsiveCard } from '..'
import { render } from '@/test-utils'

describe('ResponsiveCard', () => {
  it('rendrer slik den skal uten className', async () => {
    const { asFragment } = render(
      <ResponsiveCard>
        <p>lorem ipsum</p>
      </ResponsiveCard>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer slik den skal med className', async () => {
    const { asFragment } = render(
      <ResponsiveCard className="className">
        <p>lorem ipsum</p>
      </ResponsiveCard>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer slik den skal med hasLargePadding og hasMargin', async () => {
    const { asFragment } = render(
      <ResponsiveCard hasLargePadding hasMargin>
        <p>lorem ipsum</p>
      </ResponsiveCard>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
