import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe } from 'vitest'

import { ROUTER_BASE_URL, routes } from '..'
import { render, screen, swallowErrors, userEvent } from '@/test-utils'

describe('routes', () => {
  it('/pensjon/kalkulator viser landingssiden med lenke til stegvisning', async () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator'],
    })

    render(<RouterProvider router={router} />, { hasRouter: false })

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Midlertidig landingsside'
    )

    await userEvent.click(screen.getByText('Test kalkulatoren'))

    expect(
      await screen.findByText('stegvisning.stegvisning.start.title Aprikos!')
    ).toBeVisible()
  })

  it('/pensjon/kalkulator/start viser Steg 1', async () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator/start'],
    })

    render(<RouterProvider router={router} />, { hasRouter: false })

    expect(
      await screen.findByText('stegvisning.stegvisning.start.title Aprikos!')
    ).toBeVisible()
  })

  it('/pensjon/kalkulator/samtykke viser Steg 2', () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator/samtykke'],
    })

    render(<RouterProvider router={router} />, { hasRouter: false })

    expect(
      screen.getByText('stegvisning.stegvisning.samtykke.title')
    ).toBeInTheDocument()
  })

  it('/pensjon/kalkulator/offentlig-tp viser Steg 3 (gitt at brukeren har samtykket)', () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator/offentlig-tp'],
    })

    render(<RouterProvider router={router} />, {
      preloadedState: { userInput: { samtykke: true } },
      hasRouter: false,
    })

    expect(
      screen.getByText('stegvisning.stegvisning.offentligtp.title')
    ).toBeInTheDocument()
  })

  it('/pensjon/kalkulator/afp viser Steg 4 (gitt at brukeren har samtykket og har tpo medlemskap)', async () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator/afp'],
    })

    render(<RouterProvider router={router} />, {
      preloadedState: { userInput: { samtykke: true } },
      hasRouter: false,
    })

    expect(
      await screen.findByText('stegvisning.stegvisning.afp.title')
    ).toBeInTheDocument()
  })

  it('/pensjon/kalkulator/beregning viser beregningen', () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator/beregning'],
    })

    render(<RouterProvider router={router} />, { hasRouter: false })

    expect(
      screen.getByText('Henter tidligste mulige uttaksalder')
    ).toBeInTheDocument()
  })

  it('Uregistrerte url med path /pensjon/kalkulator sender til 404 siden', () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator/abc'],
    })

    swallowErrors(() => {
      render(<RouterProvider router={router} />, { hasRouter: false })

      expect(screen.getByText('Denne siden finnes ikke')).toBeInTheDocument()
    })
  })
})
