import { render } from '@/test-utils'

import { InfoOmInntekt } from '..'

describe('InfoModalInntekt', () => {
  it('viser fast info om inntekt', () => {
    const { asFragment } = render(<InfoOmInntekt />)
    expect(asFragment()).toMatchSnapshot()
  })
})
