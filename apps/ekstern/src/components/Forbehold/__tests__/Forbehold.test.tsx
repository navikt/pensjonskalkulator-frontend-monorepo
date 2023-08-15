import { Forbehold } from '..'
import { render } from '@/test-utils'

describe('Forbehold', () => {
  it('rendrer riktig', () => {
    const { asFragment } = render(<Forbehold />)
    expect(asFragment()).toMatchSnapshot()
  })
})
