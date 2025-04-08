import { RouterProvider, createMemoryRouter } from 'react-router'
import { describe, it, vi } from 'vitest'

import {
  BASE_PATH,
  externalUrls,
  henvisningUrlParams,
  paths,
} from '@/router/constants'
import { routes } from '@/router/routes'
import * as userInputReducerUtils from '@/state/userInput/userInputSlice'
import { render, screen, userEvent } from '@/test-utils'

import { Henvisning } from '../Henvisning'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})
describe('Henvisning ', async () => {
  afterEach(() => {
    navigateMock.mockReset()
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

  it('trykker avbryt knapp', async () => {
    const flushMock = vi.spyOn(userInputReducerUtils.userInputActions, 'flush')
    const user = userEvent.setup()
    render(<Henvisning />)
    await user.click(screen.getByTestId('card-button-secondary'))
    expect(flushMock).toHaveBeenCalled()
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
