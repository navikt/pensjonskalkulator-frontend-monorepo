import { InfoOmInntekt } from '..'
import { render } from '@/test-utils'

describe('InfoModalInntekt', () => {
  it('viser fast info om inntekt', () => {
    const { asFragment } = render(<InfoOmInntekt />)
    expect(asFragment()).toMatchSnapshot()
  })
})
