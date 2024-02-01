import { InfoOmInntekt } from '..'
import { render } from '@/test-utils'

describe('InfoModalInntekt', () => {
  it('viser fast info ominntekt', () => {
    const { asFragment } = render(<InfoOmInntekt />)
    expect(asFragment()).toMatchSnapshot()
  })
})
