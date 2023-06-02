import { describe, it } from 'vitest'

import { LandingPage } from '..'
import { render, screen, waitFor } from '@/test-utils'

describe('LandingPage', () => {
  it('rendrer slik den skal, med riktig heading', async () => {
    const result = render(<LandingPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Midlertidig landingsside'
      )
      expect(result.asFragment()).toMatchSnapshot()
    })
  })
})
