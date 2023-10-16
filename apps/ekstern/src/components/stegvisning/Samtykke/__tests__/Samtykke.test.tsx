import { describe, it, vi } from 'vitest'

import { Samtykke } from '..'
import { RootState } from '@/state/store'
import { act, screen, render, waitFor, userEvent } from '@/test-utils'

describe('stegvisning - Samtykke', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()
  it('rendrer slik den skal når samtykket ikke er oppgitt', async () => {
    const result = render(
      <Samtykke
        harSamtykket={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.samtykke.title'
    )
    const radioButtons = screen.getAllByRole('radio')

    await waitFor(() => {
      expect(screen.getAllByRole('radio')).toHaveLength(2)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })
  describe('rendrer slik den skal når samtykket er oppgitt', async () => {
    it('når samtykket er true', async () => {
      render(
        <Samtykke
          harSamtykket
          onCancel={onCancelMock}
          onPrevious={onPreviousMock}
          onNext={onNextMock}
        />
      )
      const radioButtons = screen.getAllByRole('radio')
      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(2)
        expect(radioButtons[0]).toBeChecked()
        expect(radioButtons[1]).not.toBeChecked()
      })
    })

    it('når samtykket er false', async () => {
      render(
        <Samtykke
          harSamtykket={false}
          onCancel={onCancelMock}
          onPrevious={onPreviousMock}
          onNext={onNextMock}
        />
      )
      const radioButtons = screen.getAllByRole('radio')
      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(2)
        expect(radioButtons[0]).not.toBeChecked()
        expect(radioButtons[1]).toBeChecked()
      })
    })
  })

  it('validerer, viser feilmelding, fjerner feilmelding og kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <Samtykke
        harSamtykket={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    const radioButtons = screen.getAllByRole('radio')

    await act(async () => {
      await user.click(screen.getByText('stegvisning.neste'))
    })

    waitFor(() => {
      expect(
        screen.getByText('stegvisning.samtykke.validation_error')
      ).toBeInTheDocument()
      expect(onNextMock).not.toHaveBeenCalled()
    })

    await act(async () => {
      await user.click(radioButtons[0])
    })

    expect(
      screen.queryByText('stegvisning.samtykke.validation_error')
    ).not.toBeInTheDocument()

    await act(async () => {
      await user.click(screen.getByText('stegvisning.neste'))
    })

    waitFor(() => {
      expect(onNextMock).toHaveBeenCalled()
    })
  })

  it('kaller onPrevious når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    render(
      <Samtykke
        harSamtykket
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />,
      {
        preloadedState: { userInput: { samtykke: true } } as RootState,
      }
    )
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons[0]).toBeChecked()

    await act(async () => {
      await user.click(screen.getByText('stegvisning.tilbake'))
    })

    waitFor(() => {
      expect(onPreviousMock).toHaveBeenCalled()
    })
  })

  it('kaller onCancelMock når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    render(
      <Samtykke
        harSamtykket
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )

    await act(async () => {
      await user.click(screen.getByText('stegvisning.avbryt'))
    })

    waitFor(() => {
      expect(onCancelMock).toHaveBeenCalled()
    })
  })
})
