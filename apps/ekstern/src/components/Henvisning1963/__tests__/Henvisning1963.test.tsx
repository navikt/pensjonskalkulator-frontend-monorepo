import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Henvisning1963 } from '../Henvisning1963'
import { externalUrls, paths } from '@/router'
import { render, screen, userEvent } from '@/test-utils'

const navigateMock = vi.fn()

describe('Henvisning1963', async () => {
  beforeEach(() => {
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
  })
  afterEach(() => {
    navigateMock.mockReset()
  })

  it('rendrer', () => {
    const { asFragment } = render(<Henvisning1963 />)

    expect(document.title).toBe('application.title.henvisning_1963')
    expect(asFragment()).toMatchSnapshot()
    expect(screen.getByTestId('henvisning-1963')).toBeVisible()
  })

  it('trykker avbryt knapp', async () => {
    const user = userEvent.setup()
    render(<Henvisning1963 />)

    await user.click(screen.getByTestId('card-button-secondary'))

    expect(navigateMock).toHaveBeenNthCalledWith(1, paths.login)
  })

  it('trykker detaljert kalkulator knapp', async () => {
    const user = userEvent.setup()
    const open = vi.fn()
    vi.stubGlobal('open', open)
    render(<Henvisning1963 />)

    await user.click(screen.getByTestId('card-button-primary'))

    expect(open).toHaveBeenCalledWith(externalUrls.detaljertKalkulator, '_self')
  })
})
