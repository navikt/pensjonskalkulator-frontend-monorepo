import { describe, it, vi } from 'vitest'

import { Sivilstand } from '..'
import { RootState } from '@/state/store'
import { screen, render, waitFor, userEvent } from '@/test-utils'

describe('stegvisning - Sivilstand', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()
  it('rendrer slik den skal når sivilstand ikke er oppgitt', async () => {
    const result = render(
      <Sivilstand
        sivilstand="UOPPGITT"
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

    await waitFor(async () => {
      expect(screen.getAllByRole('radio')).toHaveLength(2)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
      expect(screen.getByText('ugift', { exact: false })).toBeVisible()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })
  describe('rendrer slik den skal når sivilstand er oppgitt', async () => {
    it('når harSamboer er true', async () => {
      render(
        <Sivilstand
          sivilstand="UGIFT"
          harSamboer
          onCancel={onCancelMock}
          onPrevious={onPreviousMock}
          onNext={onNextMock}
        />
      )
      const radioButtons = screen.getAllByRole('radio')
      await waitFor(async () => {
        expect(screen.getAllByRole('radio')).toHaveLength(2)
        expect(radioButtons[0]).toBeChecked()
        expect(radioButtons[1]).not.toBeChecked()
        expect(screen.getByText('ugift', { exact: false })).toBeVisible()
      })
    })

    it('når harSamboer er false', async () => {
      render(
        <Sivilstand
          sivilstand="UGIFT"
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
        expect(screen.getByText('ugift', { exact: false })).toBeVisible()
      })
    })
  })

  it('validerer, viser feilmelding, fjerner feilmelding og kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <Sivilstand
        sivilstand="UGIFT"
        harSamboer={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    const radioButtons = screen.getAllByRole('radio')

    await user.click(screen.getByText('stegvisning.beregn'))

    waitFor(() => {
      expect(
        screen.getByText('stegvisning.sivilstand.validation_error')
      ).toBeInTheDocument()
      expect(onNextMock).not.toHaveBeenCalled()
    })

    await user.click(radioButtons[0])

    expect(
      screen.queryByText('stegvisning.sivilstand.validation_error')
    ).not.toBeInTheDocument()

    await user.click(screen.getByText('stegvisning.beregn'))

    waitFor(() => {
      expect(onNextMock).toHaveBeenCalled()
    })
  })

  it('kaller onPrevious når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    render(
      <Sivilstand
        sivilstand="UGIFT"
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

    await user.click(screen.getByText('stegvisning.tilbake'))

    waitFor(() => {
      expect(onPreviousMock).toHaveBeenCalled()
    })
  })

  it('kaller onCancelMock når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    render(
      <Sivilstand
        sivilstand="UGIFT"
        harSamboer
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )

    expect(screen.getByText('stegvisning.avbryt')).toBeInTheDocument()
    await user.click(screen.getByText('stegvisning.avbryt'))

    waitFor(() => {
      expect(onCancelMock).toHaveBeenCalled()
    })
  })

  it('viser ikke avbryt knapp når onCancel ikke er definert', async () => {
    render(
      <Sivilstand
        sivilstand="UGIFT"
        harSamboer
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.queryByText('stegvisning.avbryt')).not.toBeInTheDocument()
  })
})
