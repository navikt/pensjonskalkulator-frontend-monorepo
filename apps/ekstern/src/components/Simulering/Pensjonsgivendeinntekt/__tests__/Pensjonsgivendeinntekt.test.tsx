import { render } from '@/test-utils'

import { Pensjonsgivendeinntekt } from '../Pensjonsgivendeinntekt'

describe('Pensjonsgivendeinntekt', () => {
  const mockGoToAvansert = vi.fn()

  it('should render without crashing', () => {
    render(<Pensjonsgivendeinntekt goToAvansert={mockGoToAvansert} />)
    // Add your test assertions here
  })
})
