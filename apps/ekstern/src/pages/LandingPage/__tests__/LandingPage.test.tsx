import { describe, it, vi } from 'vitest'

import { LandingPage } from '..'
import { render, screen, waitFor } from '@/test-utils'
import { mockResponse } from '@/mocks/server'

describe('LandingPage', () => {
  it('rendrer slik den skal, med riktig heading', async () => {
    vi.mock('@/utils/useRequest', () => ({
      default: () => console.log,
    }))

    mockResponse('/oauth2/session')
    const result = render(<LandingPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Utlogget landingsside'
      )
      expect(result.asFragment()).toMatchSnapshot()
    })
  })
})
