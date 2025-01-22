import { describe, it, vi } from 'vitest'

import { Sivilstand } from '..'
import { RootState } from '@/state/store'
import { screen, render, waitFor, userEvent, fireEvent } from '@/test-utils'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('stegvisning - Sivilstand', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()

  it('rendrer slik den skal når sivilstand ikke er oppgitt', async () => {
    const result = render(
      <Sivilstand
        sivilstand="UOPPGITT"
        epsHarPensjon={null}
        epsHarInntektOver2G={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.sivilstand.title'
    )

    const selectElement = screen.getByRole('combobox', {
      name: /stegvisning.sivilstand.select_label/i,
    })

    await waitFor(() => {
      expect(selectElement).toBeVisible()
      expect(screen.queryAllByRole('radio')).toHaveLength(0)
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('kaller navigate når shouldRedirectTo er angitt', async () => {
    const randomPath = '/random-path'

    render(
      <Sivilstand
        sivilstand="UOPPGITT"
        shouldRedirectTo={randomPath}
        epsHarPensjon={null}
        epsHarInntektOver2G={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(navigateMock).toHaveBeenCalledWith(randomPath)
  })

  describe('rendrer slik den skal når sivilstand er oppgitt', async () => {
    it('når bruker endrer sivilstand, skal ny sivilstand vises', async () => {
      render(
        <Sivilstand
          sivilstand="UGIFT"
          epsHarPensjon={null}
          epsHarInntektOver2G={null}
          onCancel={onCancelMock}
          onPrevious={onPreviousMock}
          onNext={onNextMock}
        />
      )

      const selectElement = screen.getByRole('combobox', {
        name: /stegvisning.sivilstand.select_label/i,
      })
      fireEvent.change(selectElement, { target: { value: 'SKILT' } })

      await waitFor(() => {
        expect(selectElement).toHaveValue('SKILT')
      })
    })
    describe('når sivilstand er gift, samboer eller registrert partner, ', async () => {
      it('skal radio button for epsHarPensjon rendres', async () => {
        render(
          <Sivilstand
            sivilstand="GIFT"
            epsHarPensjon={null}
            epsHarInntektOver2G={null}
            onCancel={onCancelMock}
            onPrevious={onPreviousMock}
            onNext={onNextMock}
          />
        )
        const epsHarPensjonRadioGroup = screen.getByRole('radiogroup', {
          name: /epsHarPensjon/i,
        })
        const epsHarInntektOver2GRadioGroup = screen.queryByRole('radiogroup', {
          name: /epsHarInntektOver2G/i,
        })

        await waitFor(() => {
          expect(epsHarPensjonRadioGroup).toBeVisible()
          expect(epsHarInntektOver2GRadioGroup).not.toBeInTheDocument()
        })
      })
      describe('gitt at sivilstanden din er gift, ', async () => {
        it('skal teksten for epsHarPensjon endres til "ektefellen din"', async () => {
          render(
            <Sivilstand
              sivilstand="GIFT"
              epsHarPensjon={null}
              epsHarInntektOver2G={null}
              onCancel={onCancelMock}
              onPrevious={onPreviousMock}
              onNext={onNextMock}
            />
          )

          await waitFor(() => {
            expect(
              screen.getByText(
                'Vil ektefellen din motta pensjon eller uføretrygd fra folketrygden, eller AFP?'
              )
            ).toBeInTheDocument()
          })
        })
      })
      describe('gitt at sivilstanden din er samboer, ', async () => {
        it('skal teksten for epsHarPensjon endres til "samboeren din"', async () => {
          render(
            <Sivilstand
              sivilstand="GIFT"
              epsHarPensjon={null}
              epsHarInntektOver2G={null}
              onCancel={onCancelMock}
              onPrevious={onPreviousMock}
              onNext={onNextMock}
            />
          )

          await waitFor(() => {
            expect(
              screen.getByText(
                'Vil samboeren din motta pensjon eller uføretrygd fra folketrygden, eller AFP?'
              )
            ).toBeInTheDocument()
          })
        })
      })
      describe('gitt at sivilstanden din er registrert partner, ', async () => {
        it('skal teksten for epsHarPensjon endres til "partneren din"', async () => {
          render(
            <Sivilstand
              sivilstand="GIFT"
              epsHarPensjon={null}
              epsHarInntektOver2G={null}
              onCancel={onCancelMock}
              onPrevious={onPreviousMock}
              onNext={onNextMock}
            />
          )

          await waitFor(() => {
            expect(
              screen.getByText(
                'Vil partneren din motta pensjon eller uføretrygd fra folketrygden, eller AFP?'
              )
            ).toBeInTheDocument()
          })
        })
      })
    })
    describe('gitt radio button for epsHarPensjon settes til "Ja" ', async () => {
      it('skal ikke radio button for epsHarInntektOver2G vises', async () => {
        render(
          <Sivilstand
            sivilstand="GIFT"
            epsHarPensjon={null}
            epsHarInntektOver2G={null}
            onCancel={onCancelMock}
            onPrevious={onPreviousMock}
            onNext={onNextMock}
          />
        )

        const radioButtons = screen.getAllByRole('radio', {
          name: /stegvisning.sivilstand.radio_ja/i,
        })
        const radioButtonJa = radioButtons[0]
        fireEvent.click(radioButtonJa)

        const epsHarInntektOver2GRadioGroup = screen.queryByRole('radiogroup', {
          name: /epsHarInntektOver2G/i,
        })

        await waitFor(() => {
          expect(radioButtonJa).toBeChecked()
          expect(epsHarInntektOver2GRadioGroup).not.toBeInTheDocument()
        })
      })
    })
    describe('gitt radio button for epsHarPensjon settes til "Nei" ', async () => {
      it('skal radio button for epsHarInntektOver2G vises', async () => {
        render(
          <Sivilstand
            sivilstand="GIFT"
            epsHarPensjon={null}
            epsHarInntektOver2G={null}
            onCancel={onCancelMock}
            onPrevious={onPreviousMock}
            onNext={onNextMock}
          />
        )

        const radioButtons = screen.getAllByRole('radio', {
          name: /stegvisning.sivilstand.radio_nei/i,
        })
        const radioButtonNei = radioButtons[0]
        fireEvent.click(radioButtonNei)

        const epsHarInntektOver2GRadioGroup = screen.queryByRole('radiogroup', {
          name: /epsHarInntektOver2G/i,
        })

        await waitFor(() => {
          expect(radioButtonNei).toBeChecked()
          expect(epsHarInntektOver2GRadioGroup).toBeVisible()
        })
      })
    })
  })

  it.skip('validerer, viser feilmelding, fjerner feilmelding og kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <Sivilstand
        sivilstand="UGIFT"
        epsHarPensjon={null}
        epsHarInntektOver2G={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    const radioButtons = screen.getAllByRole('radio')

    await user.click(screen.getByText('stegvisning.neste'))

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

    await user.click(screen.getByText('stegvisning.neste'))

    waitFor(() => {
      expect(onNextMock).toHaveBeenCalled()
    })
  })

  it('kaller onPrevious når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    render(
      <Sivilstand
        sivilstand="UGIFT"
        epsHarPensjon={null}
        epsHarInntektOver2G={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />,
      {
        preloadedState: { userInput: { sivilstand: 'UGIFT' } } as RootState,
      }
    )

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
        epsHarPensjon={null}
        epsHarInntektOver2G={null}
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
        epsHarPensjon={null}
        epsHarInntektOver2G={null}
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.queryByText('stegvisning.avbryt')).not.toBeInTheDocument()
  })
})
