import { describe, it } from 'vitest'

import { render } from '@/test-utils'

import { Card } from '..'

describe('Card', () => {
  it('rendrer slik den skal uten className', async () => {
    const { asFragment } = render(
      <Card>
        <p>lorem ipsum</p>
      </Card>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer slik den skal med className', async () => {
    const { asFragment } = render(
      <Card className="className">
        <p>lorem ipsum</p>
      </Card>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer slik den skal med hasLargePadding og hasMargin', async () => {
    const { asFragment } = render(
      <Card hasLargePadding hasMargin>
        <p>lorem ipsum</p>
      </Card>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
