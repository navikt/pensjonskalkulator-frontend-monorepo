import { describe, it, vi } from 'vitest'

import { loependeVedtak75UfoeregradMock } from '@/mocks'
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

  it('viser "dette_henter_vi_OFTP" når person ikke er apoteker, men har loepende vedtak og ikke er kap19', () => {
    render(
      <SamtykkePensjonsavtaler
        harSamtykket
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
        erApoteker={false}
        isKap19={false}
      />,
      {
        preloadedApiState: {
          getLoependeVedtak: loependeVedtak75UfoeregradMock,
        },
      }
    )
    expect(screen.getByTestId('dette_henter_vi_OFTP')).toBeInTheDocument()
  })

  it('viser info-alert når kap19-bruker uten loepende vedtak svarer nei', async () => {
    const user = userEvent.setup()
    render(
      <SamtykkePensjonsavtaler
        harSamtykket={null}
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
        erApoteker={false}
        isKap19
      />,
      {
        preloadedState: {
          userInput: {
            afpUtregningValg: 'AFP_ETTERFULGT_AV_ALDERSPENSJON',
          },
        } as RootState,
      }
    )
    const radioButtons = screen.getAllByRole('radio')
    await user.click(radioButtons[1])
    await waitFor(() => {
      expect(
        screen.getByTestId('samtykke-pensjonsavtaler-alert')
      ).toBeInTheDocument()
    })
  })

  it('viser ikke info-alert når kap19-bruker svarer ja', async () => {
    const user = userEvent.setup()
    render(
      <SamtykkePensjonsavtaler
        harSamtykket={null}
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
        erApoteker={false}
        isKap19
      />,
      {
        preloadedState: {
          userInput: {
            afpUtregningValg: 'AFP_ETTERFULGT_AV_ALDERSPENSJON',
          },
        } as RootState,
      }
    )
    const radioButtons = screen.getAllByRole('radio')
    await user.click(radioButtons[0])
    expect(
      screen.queryByTestId('samtykke-pensjonsavtaler-alert')
    ).not.toBeInTheDocument()
  })

  it('viser "dette_sjekker_vi_OFTP" når person er kap19 med loepende vedtak', () => {
    render(
      <SamtykkePensjonsavtaler
        harSamtykket
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
        erApoteker={false}
        isKap19={true}
      />,
      {
        preloadedApiState: {
          getLoependeVedtak: loependeVedtak75UfoeregradMock,
        },
      }
    )
    expect(screen.getByTestId('dette_sjekker_vi_OFTP')).toBeInTheDocument()
  })

  it('viser "dette_henter_vi_OFTP" når person er kap19 uten loepende vedtak', () => {
    render(
      <SamtykkePensjonsavtaler
        harSamtykket
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
        erApoteker={false}
        isKap19
      />
    )
    expect(screen.getByTestId('dette_henter_vi_OFTP')).toBeInTheDocument()
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
