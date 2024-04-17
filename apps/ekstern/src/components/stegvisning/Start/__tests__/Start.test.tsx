import { describe, it, vi } from 'vitest'

import { Start } from '..'
import { render, screen, waitFor, userEvent } from '@/test-utils'

describe('stegvisning - Start', () => {
  const onCancelMock = vi.fn()
  const onNextMock = vi.fn()

  it('rendrer slik den skal med navn, med riktig heading, bilde, tekst og knapper', async () => {
    const result = render(
      <Start navn="Ola" onCancel={onCancelMock} onNext={onNextMock} />
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.start.title Ola!'
      )
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('rendrer slik den skal uten navn, med riktig heading, bilde, tekst og knapper', async () => {
    const result = render(
      <Start navn="" onCancel={onCancelMock} onNext={onNextMock} />
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.start.title!'
      )
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(<Start navn="Ola" onCancel={onCancelMock} onNext={onNextMock} />)
    await user.click(screen.getByText('stegvisning.start.button'))
    expect(onNextMock).toHaveBeenCalled()
  })

  it('kaller onCancel når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    render(<Start navn="Ola" onCancel={onCancelMock} onNext={onNextMock} />)
    await user.click(screen.getByText('stegvisning.avbryt'))
    expect(onCancelMock).toHaveBeenCalled()
  })
})
