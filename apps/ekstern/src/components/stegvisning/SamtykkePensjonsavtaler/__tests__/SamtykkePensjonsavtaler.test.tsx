import { describe, it, vi } from 'vitest'

import { RootState } from '@/state/store'
import { render, screen, userEvent, waitFor } from '@/test-utils'

import { SamtykkePensjonsavtaler } from '..'

describe('stegvisning - SamtykkePensjonsavtaler', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()
  it('rendrer slik den skal når samtykket ikke er oppgitt', async () => {
    render(
      <SamtykkePensjonsavtaler
        harSamtykket={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
        erApoteker={false}
        isKap19={false}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.samtykke_pensjonsavtaler.title'
    )
    const radioButtons = screen.getAllByRole('radio')

    await waitFor(() => {
      expect(screen.getAllByRole('radio')).toHaveLength(2)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
    })
  })
  describe('rendrer slik den skal når samtykket er oppgitt', async () => {
    it('når samtykket er true', async () => {
      render(
        <SamtykkePensjonsavtaler
          harSamtykket
          onCancel={onCancelMock}
          onPrevious={onPreviousMock}
          onNext={onNextMock}
          erApoteker={false}
          isKap19={false}
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
        <SamtykkePensjonsavtaler
          harSamtykket={false}
          onCancel={onCancelMock}
          onPrevious={onPreviousMock}
          onNext={onNextMock}
          erApoteker={false}
          isKap19={false}
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
      <SamtykkePensjonsavtaler
        harSamtykket={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
        erApoteker={false}
        isKap19={false}
      />
    )
    const radioButtons = screen.getAllByRole('radio')

    await user.click(screen.getByText('stegvisning.neste'))

    expect(
      screen.getByText('stegvisning.samtykke_pensjonsavtaler.validation_error')
    ).toBeInTheDocument()
    expect(onNextMock).not.toHaveBeenCalled()

    await user.click(radioButtons[0])

    expect(
      screen.queryByText(
        'stegvisning.samtykke_pensjonsavtaler.validation_error'
      )
    ).not.toBeInTheDocument()

    await user.click(screen.getByText('stegvisning.neste'))

    expect(onNextMock).toHaveBeenCalled()
  })

  it('kaller onPrevious når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    render(
      <SamtykkePensjonsavtaler
        harSamtykket
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
        erApoteker={false}
        isKap19={false}
      />,
      {
        preloadedState: { userInput: { samtykke: true } } as RootState,
      }
    )
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons[0]).toBeChecked()
    await user.click(screen.getByText('stegvisning.tilbake'))
    expect(onPreviousMock).toHaveBeenCalled()
  })

  it('kaller onCancelMock når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    render(
      <SamtykkePensjonsavtaler
        harSamtykket
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
        erApoteker={false}
        isKap19={false}
      />
    )
    expect(screen.getByText('stegvisning.avbryt')).toBeInTheDocument()
    await user.click(screen.getByText('stegvisning.avbryt'))
    expect(onCancelMock).toHaveBeenCalled()
  })

  it('viser ikke avbryt knapp når onCancel ikke er definert', async () => {
    render(
      <SamtykkePensjonsavtaler
        harSamtykket
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
        erApoteker={false}
        isKap19={false}
      />
    )
    expect(screen.queryByText('stegvisning.avbryt')).not.toBeInTheDocument()
  })

  it('viser "dette_henter_vi_OFTP" hvis person ikke er apoteker eller kap19', () => {
    render(
      <SamtykkePensjonsavtaler
        harSamtykket
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
        erApoteker={false}
        isKap19={false}
      />
    )
    expect(screen.getByTestId('dette_henter_vi_OFTP')).toBeInTheDocument()
  })
  it('viser "dette_sjekker_vi_OFTP" er kap19', () => {
    render(
      <SamtykkePensjonsavtaler
        harSamtykket
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
        erApoteker={false}
        isKap19={true}
      />
    )
    expect(screen.getByTestId('dette_sjekker_vi_OFTP')).toBeInTheDocument()
  })

  it('viser "dette_sjekker_vi_OFTP" er apoteker og ikke kap19', () => {
    render(
      <SamtykkePensjonsavtaler
        harSamtykket
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
        erApoteker={true}
        isKap19={false}
      />
    )
    expect(screen.getByTestId('dette_sjekker_vi_OFTP')).toBeInTheDocument()
  })

  it('viser "dette_sjekker_vi_OFTP" er apoteker og kap19', () => {
    render(
      <SamtykkePensjonsavtaler
        harSamtykket
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
        erApoteker={true}
        isKap19={true}
      />
    )
    expect(screen.getByTestId('dette_sjekker_vi_OFTP')).toBeInTheDocument()
  })
})
