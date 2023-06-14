import { describe, it, vi } from 'vitest'

import { Sivilstand } from '..'
import { RootState } from '@/state/store'
import { act, screen, render, waitFor, fireEvent } from '@/test-utils'

describe('stegvisning - Sivilstand', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()
  it('rendrer slik den skal når sivilstand ikke er oppgitt', async () => {
    const result = render(
      <Sivilstand
        harSamboer={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.sivilstand.title'
    )
    const radioButtons = screen.getAllByRole('radio')

    await waitFor(() => {
      expect(screen.getAllByRole('radio')).toHaveLength(2)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })
  describe('rendrer slik den skal når sivilstand er oppgitt', async () => {
    it('når harSamboer er true', async () => {
      render(
        <Sivilstand
          harSamboer
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

    it('når harSamboer er false', async () => {
      render(
        <Sivilstand
          harSamboer={false}
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
    render(
      <Sivilstand
        harSamboer={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    const radioButtons = screen.getAllByRole('radio')
    act(() => {
      fireEvent.click(screen.getByText('stegvisning.beregn'))
    })
    waitFor(() => {
      expect(
        screen.getByText('stegvisning.sivilstand.validation_error')
      ).toBeInTheDocument()
      expect(onNextMock).not.toHaveBeenCalled()
    })
    act(() => {
      fireEvent.click(radioButtons[0])
    })
    expect(
      screen.queryByText('stegvisning.sivilstand.validation_error')
    ).not.toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByText('stegvisning.beregn'))
    })
    waitFor(() => {
      expect(onNextMock).toHaveBeenCalled()
    })
  })

  it('kaller onPrevious når brukeren klikker på Tilbake', () => {
    render(
      <Sivilstand
        harSamboer
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />,
      {
        preloadedState: { userInput: { samboer: true } } as RootState,
      }
    )
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons[0]).toBeChecked()
    act(() => {
      fireEvent.click(screen.getByText('stegvisning.tilbake'))
    })
    waitFor(() => {
      expect(onPreviousMock).toHaveBeenCalled()
    })
  })

  it('kaller onCancelMock når brukeren klikker på Avbryt', () => {
    render(
      <Sivilstand
        harSamboer
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    act(() => {
      fireEvent.click(screen.getByText('stegvisning.avbryt'))
    })
    waitFor(() => {
      expect(onCancelMock).toHaveBeenCalled()
    })
  })
})
