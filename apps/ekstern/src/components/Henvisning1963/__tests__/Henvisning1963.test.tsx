import { describe, it, vi } from 'vitest'

import { Henvisning1963 } from '../Henvisning1963'
import { externalUrls } from '@/router'
import { render, screen, userEvent } from '@/test-utils'

describe('Henvisning1963', async () => {
  it('rendrer', () => {
    const onAvbryt = vi.fn()
    const { asFragment } = render(<Henvisning1963 onAvbryt={onAvbryt} />)

    expect(asFragment()).toMatchSnapshot()
    expect(screen.getByTestId('henvisning-1963')).toBeVisible()
  })

  it('trykker avbryt knapp', async () => {
    const user = userEvent.setup()
    const onAvbryt = vi.fn()
    render(<Henvisning1963 onAvbryt={onAvbryt} />)

    await user.click(screen.getByTestId('henvisning-1963.avbryt-knapp'))

    expect(onAvbryt).toBeCalledTimes(1)
  })

  it('trykker detaljert kalkulator knapp', async () => {
    const user = userEvent.setup()
    const onAvbryt = vi.fn()
    const open = vi.fn()
    vi.stubGlobal('open', open)
    render(<Henvisning1963 onAvbryt={onAvbryt} />)

    await user.click(
      screen.getByTestId('henvisning-1963.gaa-til-detaljert-kalkulator-knapp')
    )

    expect(open).toHaveBeenCalledWith(externalUrls.detaljertKalkulator, '_self')
  })
})
