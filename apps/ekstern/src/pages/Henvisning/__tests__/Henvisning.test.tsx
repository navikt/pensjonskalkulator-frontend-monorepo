import * as ReactRouterUtils from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, it, vi } from 'vitest'

import { Henvisning } from '../Henvisning'
import {
  BASE_PATH,
  externalUrls,
  henvisningUrlParams,
  paths,
} from '@/router/constants'
import { routes } from '@/router/routes'
import { render, screen, userEvent } from '@/test-utils'

const navigateMock = vi.fn()
describe('Henvisning ', async () => {
  beforeEach(() => {
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
  })
  afterEach(() => {
    navigateMock.mockReset()
  })

  it('rendrer henvisning til foedselsdato', async () => {
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [
        `${BASE_PATH}${paths.henvisning}/${henvisningUrlParams.foedselsdato}`,
      ],
    })
    const { asFragment } = render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    expect(
      await screen.findByText('henvisning.foedselsdato.body')
    ).toBeVisible()
    expect(document.title).toBe('application.title.henvisning.foedselsdato')
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer henvisning til ufoeretrygd', async () => {
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [
        `${BASE_PATH}${paths.henvisning}/${henvisningUrlParams.ufoeretrygd}`,
      ],
    })
    const { asFragment } = render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    expect(await screen.findByText('henvisning.ufoeretrygd.body')).toBeVisible()
    expect(document.title).toBe('application.title.henvisning.ufoeretrygd')
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer henvisning til gjenlevende', async () => {
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [
        `${BASE_PATH}${paths.henvisning}/${henvisningUrlParams.gjenlevende}`,
      ],
    })
    const { asFragment } = render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    expect(await screen.findByText('henvisning.gjenlevende.body')).toBeVisible()
    expect(document.title).toBe('application.title.henvisning.gjenlevende')
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer henvisning til apotekerne', async () => {
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [
        `${BASE_PATH}${paths.henvisning}/${henvisningUrlParams.apotekerne}`,
      ],
    })
    const { asFragment } = render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    expect(await screen.findByText('henvisning.apotekerne.body')).toBeVisible()
    expect(document.title).toBe('application.title.henvisning.apotekerne')
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer henvisning til utland', async () => {
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [
        `${BASE_PATH}${paths.henvisning}/${henvisningUrlParams.utland}`,
      ],
    })
    const { asFragment } = render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    expect(await screen.findByText('henvisning.utland.body')).toBeVisible()
    expect(document.title).toBe('application.title.henvisning.utland')
    expect(asFragment()).toMatchSnapshot()
  })

  it('trykker avbryt knapp', async () => {
    const user = userEvent.setup()
    render(<Henvisning />)
    await user.click(screen.getByTestId('card-button-secondary'))
    expect(navigateMock).toHaveBeenNthCalledWith(1, paths.login)
  })

  it('trykker detaljert kalkulator knapp', async () => {
    const user = userEvent.setup()
    const open = vi.fn()
    vi.stubGlobal('open', open)
    render(<Henvisning />)
    await user.click(screen.getByTestId('card-button-primary'))
    expect(open).toHaveBeenCalledWith(externalUrls.detaljertKalkulator, '_self')
  })
})
