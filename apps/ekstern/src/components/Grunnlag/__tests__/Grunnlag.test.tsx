import { Grunnlag } from '@/components/Grunnlag'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, waitFor } from '@/test-utils'

describe('Grunnlag', () => {
  it('viser alle seksjonene og forbehold', async () => {
    render(<Grunnlag />)
    expect(await screen.findByText('grunnlag.title')).toBeInTheDocument()
    expect(await screen.findByText('grunnlag.ingress')).toBeInTheDocument()
    expect(await screen.findByText('grunnlag.uttaksgrad.title')).toBeVisible()
    expect(await screen.findByText('grunnlag.inntekt.title')).toBeVisible()
    expect(await screen.findByText('grunnlag.sivilstand.title')).toBeVisible()
    expect(await screen.findByText('grunnlag.opphold.title')).toBeVisible()
    expect(
      await screen.findByText('grunnlag.alderspensjon.title')
    ).toBeVisible()
    expect(await screen.findByText('grunnlag.afp.title')).toBeVisible()
    expect(await screen.findByText('grunnlag.forbehold.title')).toBeVisible()
  })

  describe('Grunnlag - uttaksgrad', () => {
    it('viser riktig tittel med formatert uttaksgrad og tekst', async () => {
      const user = userEvent.setup()
      render(<Grunnlag />)
      expect(screen.getByText('grunnlag.uttaksgrad.title')).toBeVisible()
      expect(screen.getByText('100 %')).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[1])

      expect(
        await screen.findByText(
          'Denne beregningen viser 100 % uttak av alderspensjon',
          { exact: false }
        )
      ).toBeVisible()
    })
  })

  describe('Grunnlag - sivilstand', () => {
    it('viser riktig tekst og lenke når henting av sivilstand er vellykket', async () => {
      const user = userEvent.setup()
      mockResponse('/v1/person', {
        status: 200,
        json: {
          fornavn: 'Ola',
          sivilstand: 'GIFT',
          foedselsdato: '1963-04-30',
        },
      })
      render(<Grunnlag />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samboer: true,
          },
        },
      })
      expect(
        await screen.findByText('grunnlag.sivilstand.title')
      ).toBeInTheDocument()
      expect(await screen.findByText('sivilstand.gift')).toBeInTheDocument()
      await waitFor(async () => {
        expect(
          screen.queryByText('grunnlag.sivilstand.title.error')
        ).not.toBeInTheDocument()
      })
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[3])

      expect(
        await screen.findByText(
          'Hvis du har lav opptjening kan størrelsen på alderspensjonen din avhenge av om du bor alene eller sammen med noen',
          { exact: false }
        )
      ).toBeVisible()
    })

    it('viser riktig tekst og lenke når brukeren har oppgitt samboerskap manuelt', async () => {
      const user = userEvent.setup()
      mockResponse('/v1/person', {
        status: 200,
        json: {
          fornavn: 'Ola',
          sivilstand: 'UGIFT',
          foedselsdato: '1963-04-30',
        },
      })
      render(<Grunnlag />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samboer: false,
          },
        },
      })
      expect(
        await screen.findByText('grunnlag.sivilstand.title')
      ).toBeInTheDocument()
      expect(
        await screen.findByText('sivilstand.ugift, sivilstand.uten_samboer')
      ).toBeVisible()
      expect(
        screen.queryByText('grunnlag.sivilstand.title.error')
      ).not.toBeInTheDocument()
      const buttons = screen.getAllByRole('button')
      await user.click(buttons[3])

      expect(
        await screen.findByText(
          'Hvis du har lav opptjening kan størrelsen på alderspensjonen din avhenge av om du bor alene eller sammen med noen',
          { exact: false }
        )
      ).toBeVisible()
    })

    it('viser feilmelding når henting av personopplysninger feiler', async () => {
      const user = userEvent.setup()
      mockErrorResponse('/v1/person')
      render(<Grunnlag />)

      await waitFor(() => {
        expect(
          screen.queryByText('grunnlag.sivilstand.title')
        ).toBeInTheDocument()
        expect(
          screen.getByText('grunnlag.sivilstand.title.error')
        ).toBeVisible()
      })
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[3])

      expect(
        await screen.findByText(
          'Hvis du har lav opptjening kan størrelsen på alderspensjonen din avhenge av om du bor alene eller sammen med noen',
          { exact: false }
        )
      ).toBeVisible()
    })
  })

  describe('Grunnlag - opphold', () => {
    it('viser riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<Grunnlag />)
      expect(screen.getByText('grunnlag.opphold.title')).toBeVisible()
      expect(screen.getByText('grunnlag.opphold.value')).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[4])

      expect(
        await screen.findByText(
          'Beregningen forutsetter at du har bodd eller jobbet i Norge i minst 40 år fra fylte 16 år',
          { exact: false }
        )
      ).toBeVisible()
    })
  })

  describe('Grunnlag - alderspensjon', () => {
    it('viser riktig tittel', async () => {
      const user = userEvent.setup()
      render(<Grunnlag />)
      expect(screen.getByText('grunnlag.alderspensjon.title')).toBeVisible()
      expect(screen.getByText('grunnlag.alderspensjon.title')).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[5])

      expect(
        await screen.findByText('Alderspensjon beregnes ut ifra', {
          exact: false,
        })
      ).toBeVisible()
    })
  })

  describe('Grunnlag - AFP', () => {
    it('Når brukeren har valgt AFP offentlig, viser riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<Grunnlag />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            afp: 'ja_offentlig',
          },
        },
      })
      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(screen.getByText('afp.offentlig')).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[6])

      expect(
        await screen.findByText('grunnlag.afp.ingress.ja_offentlig')
      ).toBeVisible()
    })

    it('Når brukeren har valgt AFP privat, viser riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<Grunnlag />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            afp: 'ja_privat',
          },
        },
      })
      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(screen.getByText('afp.privat')).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[6])

      expect(
        await screen.findByText(
          'NAV har ikke vurdert om du fyller inngangsvilkårene for å få AFP',
          { exact: false }
        )
      ).toBeVisible()
    })

    it('Når brukeren har valgt uten AFP, viser riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<Grunnlag />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            afp: 'nei',
          },
        },
      })
      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(screen.getByText('afp.nei')).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[6])

      expect(await screen.findByText('grunnlag.afp.ingress.nei')).toBeVisible()
    })

    it('Når brukeren har svart "vet ikke" på AFP, viser riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<Grunnlag />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            afp: 'vet_ikke',
          },
        },
      })
      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(screen.getByText('afp.vet_ikke')).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[6])

      expect(
        await screen.findByText('grunnlag.afp.ingress.vet_ikke')
      ).toBeVisible()
    })
  })
})
