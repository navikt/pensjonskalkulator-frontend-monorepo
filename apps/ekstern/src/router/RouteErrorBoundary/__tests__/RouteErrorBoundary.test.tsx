import { RouterProvider, createMemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'
import { act, render, screen, swallowErrors } from '@/test-utils'

describe('RouteErrorBoundary', () => {
  it('rendrer ikke feilmelding når det ikke kastes en feil', () => {
    const router = createMemoryRouter([
      { path: '/', element: null, ErrorBoundary: RouteErrorBoundary },
    ])

    render(<RouterProvider router={router} />, { hasRouter: false })

    expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument()
  })

  it('rendrer feilmelding for 404', async () => {
    const router = createMemoryRouter([
      { path: '/', element: null, ErrorBoundary: RouteErrorBoundary },
    ])

    render(<RouterProvider router={router} />, { hasRouter: false })

    act(() => {
      router.navigate('/denne/siden/finnes/ikke')
    })

    expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument()
    expect(screen.queryByTestId('error-page-404')).toBeInTheDocument()
  })

  it('rendrer feilmelding når det kastes en feil i children', () => {
    const ComponentThatThrows = () => {
      throw new Error('my expected error')
    }
    const router = createMemoryRouter([
      {
        path: '/',
        element: <ComponentThatThrows />,
        ErrorBoundary: RouteErrorBoundary,
      },
    ])

    swallowErrors(() => {
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(screen.queryByTestId('error-page-404')).not.toBeInTheDocument()
      expect(screen.queryByTestId('error-page-unexpected')).toBeInTheDocument()
    })
  })
})
