import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { HenvisningUfoeretrygdGjenlevendepensjon } from '../HenvisningUfoeretrygdGjenlevendepensjon'
import { externalUrls, paths } from '@/router'
import { render, screen, userEvent } from '@/test-utils'

const navigateMock = vi.fn()
describe('HenvisningUfoeretrygdGjenlevendepensjon ', async () => {
  beforeEach(() => {
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
  })
  afterEach(() => {
    navigateMock.mockReset()
  })
  it('rendrer', () => {
    const { asFragment } = render(<HenvisningUfoeretrygdGjenlevendepensjon />)

    expect(document.title).toBe(
      'application.title.henvisning_ufoere_gjenlevende'
    )
    expect(screen.getByTestId('henvisning-ufoere-gjenlevende')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })

  it('trykker avbryt knapp', async () => {
    const user = userEvent.setup()
    render(<HenvisningUfoeretrygdGjenlevendepensjon />)

    await user.click(screen.getByTestId('card-button-secondary'))

    expect(navigateMock).toHaveBeenNthCalledWith(1, paths.login)
  })

  it('trykker detaljert kalkulator knapp', async () => {
    const user = userEvent.setup()
    const open = vi.fn()
    vi.stubGlobal('open', open)
    render(<HenvisningUfoeretrygdGjenlevendepensjon />)

    await user.click(screen.getByTestId('card-button-primary'))

    expect(open).toHaveBeenCalledWith(externalUrls.detaljertKalkulator, '_self')
  })
})
