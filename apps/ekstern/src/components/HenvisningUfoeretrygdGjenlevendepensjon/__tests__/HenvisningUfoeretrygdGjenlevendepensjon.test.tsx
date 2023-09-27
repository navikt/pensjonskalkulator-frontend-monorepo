import { describe, it, vi } from 'vitest'

import { HenvisningUfoeretrygdGjenlevendepensjon } from '../HenvisningUfoeretrygdGjenlevendepensjon'
import { externalUrls } from '@/router'
import { render, screen, userEvent } from '@/test-utils'

describe('HenvisningUfoeretrygdGjenlevendepensjon ', async () => {
  it('rendrer', () => {
    const onAvbryt = vi.fn()
    const { asFragment } = render(
      <HenvisningUfoeretrygdGjenlevendepensjon onAvbryt={onAvbryt} />
    )

    expect(screen.getByTestId('henvisning-ufoere-gjenlevende')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })

  it('trykker avbryt knapp', async () => {
    const user = userEvent.setup()
    const onAvbryt = vi.fn()
    render(<HenvisningUfoeretrygdGjenlevendepensjon onAvbryt={onAvbryt} />)

    await user.click(
      screen.getByTestId('henvisning-ufoere-gjenlevende.avbryt-knapp')
    )

    expect(onAvbryt).toBeCalledTimes(1)
  })

  it('trykker detaljert kalkulator knapp', async () => {
    const user = userEvent.setup()
    const onAvbryt = vi.fn()
    const open = vi.fn()
    vi.stubGlobal('open', open)
    render(<HenvisningUfoeretrygdGjenlevendepensjon onAvbryt={onAvbryt} />)

    await user.click(
      screen.getByTestId(
        'henvisning-ufoere-gjenlevende.gaa-til-detaljert-kalkulator-knapp'
      )
    )

    expect(open).toHaveBeenCalledWith(externalUrls.detaljertKalkulator, '_self')
  })
})
