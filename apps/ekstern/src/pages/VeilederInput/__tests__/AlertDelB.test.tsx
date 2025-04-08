import { describe, it } from 'vitest'

import { externalUrls } from '@/router/constants'
import { render, screen, userEvent, waitFor } from '@/test-utils'

import { AlertDelB } from '../AlertDelB'

describe('AlertDelB', () => {
  it('viser alert med riktig melding', () => {
    render(<AlertDelB fnr="12345678901" />)
    expect(screen.getByTestId('alert-del-b')).toBeInTheDocument()
  })

  it('har skjult input felt med fnr verdi', () => {
    render(<AlertDelB fnr="12345678901" />)

    const input = document.querySelector(
      'input[type="hidden"]'
    ) as HTMLInputElement
    expect(input).toHaveAttribute('type', 'hidden')
    expect(input).toHaveAttribute('name', 'fnr')
    expect(input).toHaveValue('12345678901')
  })

  it('sender til riktig url når knappen klikkes', () => {
    render(<AlertDelB fnr="12345678901" />)

    const form = screen.getByTestId('alert-del-b')
    expect(form).toHaveAttribute('action', externalUrls.detaljertKalkulator)
    expect(form).toHaveAttribute('method', 'POST')
  })

  it('lukker alert når lukkeknappen klikkes', async () => {
    const user = userEvent.setup()
    render(<AlertDelB fnr="12345678901" />)

    expect(screen.getByTestId('alert-del-b')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /lukk/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('alert-del-b')).not.toBeInTheDocument()
    })
  })
})
