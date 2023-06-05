import { RouterProvider, createMemoryRouter } from 'react-router-dom'

import { describe } from 'vitest'

import { ROUTER_BASE_URL, routes } from '..'
import { render, screen, fireEvent, swallowErrors } from '@/test-utils'

describe('routes', () => {
  it('/pensjon/kalkulator viser landingssiden med lenke til stegvisning', async () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator'],
    })
    await render(<RouterProvider router={router} />, {}, { hasRouter: false })

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Midlertidig landingsside'
    )

    await fireEvent.click(screen.getByText('Test kalkulatoren'))
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.steg0.title'
    )
  })

  it('/pensjon/kalkulator/stegvisning/123456789 viser steg 0 som default i stegvisningen', async () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator/stegvisning/0'],
    })
    await render(<RouterProvider router={router} />, {}, { hasRouter: false })

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.steg0.title'
    )
  })

  it('/pensjon/kalkulator/beregning viser beregningen', async () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator/beregning'],
    })
    await render(<RouterProvider router={router} />, {}, { hasRouter: false })

    expect(
      screen.getByText('Henter tidligste mulige uttaksalder')
    ).toBeInTheDocument()
  })

  it('Uregistrerte url med path /pensjon/kalkulator sender til 404 siden', async () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator/abc'],
    })
    swallowErrors(async () => {
      await render(<RouterProvider router={router} />, {}, { hasRouter: false })

      expect(screen.getByText('Denne siden finnes ikke')).toBeInTheDocument()
    })
  })
})
