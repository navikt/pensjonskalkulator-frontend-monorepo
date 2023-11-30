import { GrunnlagForbehold } from '..'
import { render } from '@/test-utils'

describe('GrunnlagForbehold', () => {
  it('rendrer riktig', () => {
    const { asFragment } = render(<GrunnlagForbehold />)
    expect(asFragment()).toMatchSnapshot()
  })
})
