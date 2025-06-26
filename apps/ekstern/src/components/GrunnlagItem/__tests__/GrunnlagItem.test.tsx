import { render } from '@/test-utils'

import { GrunnlagItem } from '../GrunnlagItem'

describe('GrunnlagItem', () => {
  it('should render without crashing', () => {
    render(<GrunnlagItem color="green">Test</GrunnlagItem>)
    // Add your test assertions here
  })
})
