import { RouterProvider, createMemoryRouter } from 'react-router-dom'

import { describe } from 'vitest'

import { ROUTER_BASE_URL, routes } from '..'
import { render, screen, fireEvent, swallowErrors, waitFor } from '@/test-utils'

describe('routes', () => {
  it('/pensjon/kalkulator viser landingssiden med lenke til stegvisning', async () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator'],
    })
    render(<RouterProvider router={router} />, {}, { hasRouter: false })
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Midlertidig landingsside'
    )

    fireEvent.click(screen.getByText('Test kalkulatoren'))
    await waitFor(() => {
      expect(
        screen.getByText('stegvisning.stegvisning.start.title Aprikos!')
      ).toBeVisible()
    })
  })

  it('/pensjon/kalkulator/start viser Steg 1', async () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator/start'],
    })
    render(<RouterProvider router={router} />, {}, { hasRouter: false })

    await waitFor(() => {
      expect(
        screen.getByText('stegvisning.stegvisning.start.title Aprikos!')
      ).toBeVisible()
    })
  })

  it('/pensjon/kalkulator/samtykke viser Steg 2', async () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator/samtykke'],
    })
    await render(<RouterProvider router={router} />, {}, { hasRouter: false })

    expect(
      screen.getByText('stegvisning.stegvisning.samtykke.title')
    ).toBeInTheDocument()
  })

  it('/pensjon/kalkulator/offentlig-tp viser Steg 3 (gitt at brukeren har samtykket)', async () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator/offentlig-tp'],
    })
    await render(
      <RouterProvider router={router} />,
      {
        preloadedState: { userInput: { samtykke: true } },
      },
      { hasRouter: false }
    )

    expect(
      screen.getByText('stegvisning.stegvisning.offentligtp.title')
    ).toBeInTheDocument()
  })

  it('/pensjon/kalkulator/afp viser Steg 4 (gitt at brukeren har samtykket og har tpo medlemskap)', async () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator/afp'],
    })
    await render(
      <RouterProvider router={router} />,
      {
        preloadedState: { userInput: { samtykke: true } },
      },
      { hasRouter: false }
    )

    waitFor(() => {
      expect(
        screen.getByText('stegvisning.stegvisning.afp.title')
      ).toBeInTheDocument()
    })
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
