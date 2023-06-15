import { describe, it, vi } from 'vitest'

import { AFP } from '..'
import { RootState } from '@/state/store'
import { act, screen, render, waitFor, fireEvent } from '@/test-utils'

describe('stegvisning - AFP', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()

  it('rendrer slik den skal når afp ikke er oppgitt', async () => {
    const result = render(
      <AFP
        afp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.afp.title'
    )
    const radioButtons = screen.getAllByRole('radio')
    await waitFor(() => {
      expect(radioButtons).toHaveLength(4)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
      expect(radioButtons[2]).not.toBeChecked()
      expect(radioButtons[3]).not.toBeChecked()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('rendrer slik den skal når afp er oppgitt', async () => {
    const result = render(
      <AFP
        afp={'nei'}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.afp.title'
    )
    const radioButtons = screen.getAllByRole('radio')
    await waitFor(() => {
      expect(radioButtons).toHaveLength(4)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
      expect(radioButtons[2]).toBeChecked()
      expect(radioButtons[3]).not.toBeChecked()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('validerer, viser feilmelding, fjerner feilmelding og kaller onNext når brukeren klikker på Neste', async () => {
    render(
      <AFP
        afp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    const radioButtons = screen.getAllByRole('radio')
    act(() => {
      fireEvent.click(screen.getByText('stegvisning.neste'))
    })
    waitFor(() => {
      expect(
        screen.getByText('stegvisning.afp.validation_error')
      ).toBeInTheDocument()
      expect(onNextMock).not.toHaveBeenCalled()
    })
    act(() => {
      fireEvent.click(radioButtons[0])
    })
    expect(
      screen.queryByText('stegvisning.afp.validation_error')
    ).not.toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByText('stegvisning.neste'))
    })
    waitFor(() => {
      expect(onNextMock).toHaveBeenCalled()
    })
  })

  it('kaller onPrevious når brukeren klikker på Tilbake', () => {
    render(
      <AFP
        afp={'ja_privat'}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />,
      {
        preloadedState: { userInput: { samtykke: true } } as RootState,
      }
    )

    fireEvent.click(screen.getByText('stegvisning.tilbake'))
    expect(onPreviousMock).toHaveBeenCalled()
  })

  it('kaller onCancel når brukeren klikker på Avbryt', () => {
    render(
      <AFP
        afp={'ja_privat'}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )

    fireEvent.click(screen.getByText('stegvisning.avbryt'))
    expect(onCancelMock).toHaveBeenCalled()
  })
})
