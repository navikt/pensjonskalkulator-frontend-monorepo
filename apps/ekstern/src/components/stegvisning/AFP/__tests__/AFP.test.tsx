import { describe, it, vi } from 'vitest'

import { AFP } from '..'
import { screen, render, waitFor, fireEvent } from '@/test-utils'

describe('stegvisning - AFP', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()

  it('rendrer slik den skal', async () => {
    const result = render(
      <AFP
        showJaOffentligChoice={false}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.stegvisning.afp.title'
    )
    await waitFor(() => {
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('kaller onNext når brukeren klikker på Neste', () => {
    render(
      <AFP
        showJaOffentligChoice={false}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    fireEvent.click(screen.getByText('stegvisning.neste'))
    expect(onNextMock).toHaveBeenCalled()
  })

  it('kaller onPrevious når brukeren klikker på Tilbake', () => {
    render(
      <AFP
        showJaOffentligChoice={false}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )

    fireEvent.click(screen.getByText('stegvisning.tilbake'))
    expect(onPreviousMock).toHaveBeenCalled()
  })

  it('kaller onCancel når brukeren klikker på Avbryt', () => {
    render(
      <AFP
        showJaOffentligChoice={false}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )

    fireEvent.click(screen.getByText('stegvisning.avbryt'))
    expect(onCancelMock).toHaveBeenCalled()
  })
})
