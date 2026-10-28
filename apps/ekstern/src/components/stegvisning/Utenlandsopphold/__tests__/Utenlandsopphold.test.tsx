import { describe, it, vi } from 'vitest'

import { RootState } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, userEvent, waitFor } from '@/test-utils'

import { Utenlandsopphold } from '..'

describe('stegvisning - Utenlandsopphold', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()

  it('rendrer slik den skal når spørsmålet om utenlandsopphold ikke er besvart', async () => {
    render(
      <Utenlandsopphold
        harUtenlandsopphold={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.utenlandsopphold.title'
    )
    expect(
      screen.getByText('stegvisning.utenlandsopphold.ingress')
    ).toBeVisible()

    const radioButtons = screen.getAllByRole('radio')

    await waitFor(() => {
      expect(screen.getAllByRole('radio')).toHaveLength(2)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()

      expect(screen.getByTestId('hva_er_opphold_utenfor_norge')).toBeVisible()
      expect(
        screen.getByTestId('betydning_av_opphold_utenfor_norge')
      ).toBeVisible()
    })

    expect(
      screen.queryByText('stegvisning.utenlandsopphold.ingress.bottom')
    ).not.toBeInTheDocument()
  })

  describe('rendrer slik den skal når spørsmålet om utenlandsopphold er besvart', async () => {
    it('Når harUtenlandsopphold er false', async () => {
      render(
        <Utenlandsopphold
          harUtenlandsopphold={false}
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
        expect(
          screen.queryByText('stegvisning.utenlandsopphold.oppholdene.title')
        ).not.toBeInTheDocument()
        expect(
          screen.queryByText('stegvisning.utenlandsopphold.ingress.bottom')
        ).not.toBeInTheDocument()
      })
    })

    it('Når harUtenlandsopphold er true, vises listen over utenlandsperioder', async () => {
      render(
        <Utenlandsopphold
          harUtenlandsopphold={true}
          onCancel={onCancelMock}
          onPrevious={onPreviousMock}
          onNext={onNextMock}
        />
      )
      const radioButtons = await screen.findAllByRole('radio')
      await waitFor(async () => {
        expect(radioButtons).toHaveLength(2)
        expect(radioButtons[0]).toBeChecked()
        expect(radioButtons[1]).not.toBeChecked()
        expect(
          await screen.findByText(
            'stegvisning.utenlandsopphold.oppholdene.title'
          )
        ).toBeVisible()
        expect(
          await screen.findByText(
            'stegvisning.utenlandsopphold.oppholdene.description'
          )
        ).toBeVisible()
        expect(await screen.findByTestId('utenlandsopphold-land')).toBeVisible()
        expect(
          screen.queryByText('stegvisning.utenlandsopphold.ingress.bottom')
        ).not.toBeInTheDocument()
      })
    })

    it('Når harUtenlandsopphold er true og det finnes opphold, vises ingress.bottom og listen', async () => {
      render(
        <Utenlandsopphold
          harUtenlandsopphold={true}
          onCancel={onCancelMock}
          onPrevious={onPreviousMock}
          onNext={onNextMock}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
              utenlandsperioder: [
                {
                  id: '1',
                  landkode: 'AFG',
                  arbeidetUtenlands: false,
                  startdato: '20.01.2021',
                },
              ],
            },
          },
        }
      )

      expect(
        await screen.findByText('stegvisning.utenlandsopphold.ingress.bottom')
      ).toBeVisible()
      expect(
        screen.getByText(
          'stegvisning.utenlandsopphold.oppholdene.button.legg_til_nytt'
        )
      ).toBeVisible()
    })
  })

  describe('Når brukeren vil legge til en ny utenlandsperiode', async () => {
    const registrertePerioder = [
      {
        id: '1',
        landkode: 'AFG',
        arbeidetUtenlands: false,
        startdato: '20.01.2021',
      },
    ]

    it('deaktiverer Neste når skjemaet for første opphold er åpent', async () => {
      render(
        <Utenlandsopphold
          harUtenlandsopphold={true}
          onCancel={onCancelMock}
          onPrevious={onPreviousMock}
          onNext={onNextMock}
        />
      )

      expect(await screen.findByTestId('utenlandsopphold-land')).toBeVisible()
      expect(screen.getByTestId('stegvisning-neste-button')).toBeDisabled()
    })

    it('åpner skjemaet inline ved å trykke på knappen, deaktiverer Neste og aktiverer den igjen ved avbryt', async () => {
      const user = userEvent.setup()
      render(
        <Utenlandsopphold
          harUtenlandsopphold={true}
          onCancel={onCancelMock}
          onPrevious={onPreviousMock}
          onNext={onNextMock}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
              utenlandsperioder: registrertePerioder,
            },
          },
        }
      )

      expect(screen.getByTestId('stegvisning-neste-button')).toBeEnabled()

      await user.click(
        await screen.findByText(
          'stegvisning.utenlandsopphold.oppholdene.button.legg_til_nytt'
        )
      )

      expect(await screen.findByTestId('utenlandsopphold-land')).toBeVisible()
      expect(screen.getByTestId('stegvisning-neste-button')).toBeDisabled()

      await user.click(screen.getByTestId('legg-til-utenlandsopphold-avbryt'))

      expect(
        screen.queryByTestId('utenlandsopphold-land')
      ).not.toBeInTheDocument()
      expect(screen.getByTestId('stegvisning-neste-button')).toBeEnabled()
    })

    it('aktiverer ikke Neste igjen når brukeren velger Nei', async () => {
      const user = userEvent.setup()
      render(
        <Utenlandsopphold
          harUtenlandsopphold={true}
          onCancel={onCancelMock}
          onPrevious={onPreviousMock}
          onNext={onNextMock}
        />
      )

      expect(await screen.findByTestId('utenlandsopphold-land')).toBeVisible()
      expect(screen.getByTestId('stegvisning-neste-button')).toBeDisabled()

      await user.click(screen.getAllByRole('radio')[1])

      expect(screen.getByTestId('stegvisning-neste-button')).toBeEnabled()
    })
  })

  describe('Når brukeren klikker på Neste', async () => {
    it('validerer, viser feilmelding, fjerner feilmelding og kaller onNext', async () => {
      const user = userEvent.setup()
      render(
        <Utenlandsopphold
          harUtenlandsopphold={null}
          onCancel={onCancelMock}
          onPrevious={onPreviousMock}
          onNext={onNextMock}
        />
      )

      await user.click(screen.getByText('stegvisning.neste'))

      expect(
        await screen.findByText('stegvisning.utenlandsopphold.validation_error')
      ).toBeInTheDocument()
      expect(onNextMock).not.toHaveBeenCalled()

      const radioButtons = screen.getAllByRole('radio')

      await user.click(radioButtons[1])

      expect(
        screen.queryByText('stegvisning.utenlandsopphold.validation_error')
      ).not.toBeInTheDocument()

      await user.click(screen.getByText('stegvisning.neste'))

      expect(onNextMock).toHaveBeenCalled()
    })
  })

  it('kaller onPrevious når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    render(
      <Utenlandsopphold
        harUtenlandsopphold={false}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />,
      {
        preloadedState: {
          userInput: { ...userInputInitialState, harUtenlandsopphold: false },
        } as RootState,
      }
    )
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons[1]).toBeChecked()
    await user.click(screen.getByText('stegvisning.tilbake'))
    expect(onPreviousMock).toHaveBeenCalled()
  })

  it('kaller onCancelMock når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    render(
      <Utenlandsopphold
        harUtenlandsopphold={false}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByText('stegvisning.avbryt')).toBeInTheDocument()
    await user.click(screen.getByText('stegvisning.avbryt'))
    expect(onCancelMock).toHaveBeenCalled()
  })

  it('viser ikke avbryt knapp når onCancel ikke er definert', async () => {
    render(
      <Utenlandsopphold
        harUtenlandsopphold={null}
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.queryByText('stegvisning.avbryt')).not.toBeInTheDocument()
  })
})
