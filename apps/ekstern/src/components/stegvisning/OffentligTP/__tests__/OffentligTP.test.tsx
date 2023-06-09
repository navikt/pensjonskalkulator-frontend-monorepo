import { describe, it, vi } from 'vitest'

import { OffentligTP } from '..'
import { screen, render, waitFor, fireEvent } from '@/test-utils'

describe('stegvisning - OffentligTP', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()

  it('rendrer slik den skal', async () => {
    const result = render(
      <OffentligTP
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.stegvisning.offentligtp.title'
    )
    await waitFor(() => {
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('kaller onNext når brukeren klikker på Neste', () => {
    render(
      <OffentligTP
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
      <OffentligTP
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
      <OffentligTP
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )

    fireEvent.click(screen.getByText('stegvisning.avbryt'))
    expect(onCancelMock).toHaveBeenCalled()
  })
})
