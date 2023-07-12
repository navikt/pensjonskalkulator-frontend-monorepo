import { describe, it } from 'vitest'

import { StegvisningFrame } from '..'
import { render } from '@/test-utils'

describe('StegvisningFrame', () => {
  it('rendrer slik den skal uten className', async () => {
    const { asFragment } = render(
      <StegvisningFrame>
        <p>lorem ipsum</p>
      </StegvisningFrame>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer slik den skal med className', async () => {
    const { asFragment } = render(
      <StegvisningFrame className="className">
        <p>lorem ipsum</p>
      </StegvisningFrame>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
