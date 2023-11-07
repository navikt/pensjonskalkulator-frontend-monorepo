import { vi } from 'vitest'

import { Grunnlag } from '@/components/Grunnlag'
import * as velgUttaksalderUtils from '@/components/VelgUttaksalder/utils'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, waitFor } from '@/test-utils'

describe('Grunnlag', () => {
  it('viser alle seksjonene og forbehold', async () => {
    render(<Grunnlag inntekt={{ beloep: 500000, aar: 2021 }} />)
    expect(await screen.findByText('grunnlag.title')).toBeInTheDocument()
    expect(await screen.findByText('grunnlag.ingress')).toBeInTheDocument()
    expect(
      await screen.findByText('grunnlag.tidligstmuliguttak.title')
    ).toBeVisible()
    expect(await screen.findByText('grunnlag.uttaksgrad.title')).toBeVisible()
    expect(await screen.findByText('grunnlag.inntekt.title')).toBeVisible()
    expect(await screen.findByText('grunnlag.sivilstand.title')).toBeVisible()
    expect(await screen.findByText('grunnlag.opphold.title')).toBeVisible()
    expect(
      await screen.findByText('grunnlag.alderspensjon.title')
    ).toBeVisible()
    expect(await screen.findByText('grunnlag.afp.title')).toBeVisible()
    expect(
      await screen.findByText('grunnlag.pensjonsavtaler.title')
    ).toBeVisible()
    expect(await screen.findByText('grunnlag.forbehold.title')).toBeVisible()
  })

  describe('Grunnlag - tidligst mulig uttak', () => {
    it('viser riktig tittel med formatert uttaksalder og tekst', async () => {
      const user = userEvent.setup()
      const formatMock = vi.spyOn(velgUttaksalderUtils, 'formatUttaksalder')
      render(
        <Grunnlag
          inntekt={{ beloep: 500000, aar: 2021 }}
          tidligstMuligUttak={{ aar: 67, maaneder: 0 }}
        />
      )
      expect(
        screen.getByText('grunnlag.tidligstmuliguttak.title')
      ).toBeVisible()
      expect(await screen.findByText('67 år')).toBeVisible()
      expect(
        screen.queryByText('grunnlag.tidligstmuliguttak.title.error')
      ).not.toBeInTheDocument()
      expect(formatMock).toHaveBeenCalled()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[0])

      expect(
        await screen.findByText(
          'For å starte uttak mellom 62 og 67 år må opptjeningen din',
          { exact: false }
        )
      ).toBeVisible()
      expect(
        screen.queryByText('grunnlag.tidligstmuliguttak.ingress.error')
      ).not.toBeInTheDocument()
    })

    it('rendrer riktig når tidligst mulig uttaksalder ikke kunne hentes', async () => {
      const user = userEvent.setup()
      const formatMock = vi.spyOn(velgUttaksalderUtils, 'formatUttaksalder')
      render(<Grunnlag inntekt={{ beloep: 500000, aar: 2021 }} />)
      expect(
        screen.getByText('grunnlag.tidligstmuliguttak.title')
      ).toBeVisible()
      expect(
        await screen.findByText('grunnlag.tidligstmuliguttak.title.error')
      ).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[0])

      expect(
        await screen.findByText(
          'Vi klarte ikke å finne tidspunkt for når du tidligst kan ta ut alderspensjon',
          { exact: false }
        )
      ).toBeVisible()
      expect(
        await screen.findByText(
          'For å starte uttak mellom 62 og 67 år må opptjeningen din',
          { exact: false }
        )
      ).toBeVisible()
      expect(formatMock).not.toHaveBeenCalled()
    })
  })

  describe('Grunnlag - uttaksgrad', () => {
    it('viser riktig tittel med formatert uttaksgrad og tekst', async () => {
      const user = userEvent.setup()
      render(<Grunnlag inntekt={{ beloep: 500000, aar: 2021 }} />)
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

  describe('Grunnlag - inntekt', () => {
    it('viser riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<Grunnlag inntekt={{ beloep: 500000, aar: 2021 }} />)
      expect(screen.getByText('grunnlag.inntekt.title')).toBeVisible()
      expect(screen.getByText('500 000 kr')).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[2])

      expect(
        await screen.findByText(
          'Beløpet er din siste pensjonsgivende årsinntekt',
          { exact: false }
        )
      ).toBeVisible()
      expect(await screen.findByText('2021', { exact: false })).toBeVisible()
    })

    it('viser riktig tittel og tekst uten inntekt', async () => {
      const user = userEvent.setup()
      render(<Grunnlag inntekt={{ beloep: 0, aar: 0 }} />)
      expect(screen.getByText('grunnlag.inntekt.title')).toBeVisible()
      expect(screen.getByText('grunnlag.inntekt.title.error')).toBeVisible()
      expect(screen.queryByText('0 kr')).not.toBeInTheDocument()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[2])

      expect(
        await screen.findByText(
          'Du er ikke registrert med pensjonsgivende inntekt.',
          { exact: false }
        )
      ).toBeVisible()
      expect(
        screen.queryByText(
          'Beløpet er din siste pensjonsgivende årsinntekt fra Skatteetaten.',
          { exact: false }
        )
      ).not.toBeInTheDocument()
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
      render(<Grunnlag inntekt={{ beloep: 500000, aar: 2021 }} />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samboer: true,
          },
        },
      })
      await waitFor(async () => {
        expect(screen.getByText('grunnlag.sivilstand.title')).toBeVisible()
        expect(await screen.findByText('Gift')).toBeVisible()
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
      render(<Grunnlag inntekt={{ beloep: 500000, aar: 2021 }} />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samboer: false,
          },
        },
      })
      await waitFor(async () => {
        expect(screen.getByText('grunnlag.sivilstand.title')).toBeVisible()
        expect(
          screen.queryByText('grunnlag.sivilstand.title.error')
        ).not.toBeInTheDocument()
        expect(await screen.findByText('Ugift, uten samboer')).toBeVisible()
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

    it('viser feilmelding når henting av personopplysninger feiler', async () => {
      const user = userEvent.setup()
      mockErrorResponse('/v1/person')
      render(<Grunnlag inntekt={{ beloep: 500000, aar: 2021 }} />)

      await waitFor(() => {
        expect(screen.getByText('grunnlag.sivilstand.title')).toBeVisible()
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
      render(<Grunnlag inntekt={{ beloep: 500000, aar: 2021 }} />)
      expect(screen.getByText('grunnlag.opphold.title')).toBeVisible()
      expect(screen.getByText('Minst 40 år')).toBeVisible()
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
    it('viser riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<Grunnlag inntekt={{ beloep: 500000, aar: 2021 }} />)
      expect(screen.getByText('grunnlag.alderspensjon.title')).toBeVisible()
      expect(screen.getByText('Folketrygden (NAV)')).toBeVisible()
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
      render(<Grunnlag inntekt={{ beloep: 500000, aar: 2021 }} />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            afp: 'ja_offentlig',
          },
        },
      })
      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(screen.getByText('Offentlig')).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[6])

      expect(
        await screen.findByText('grunnlag.afp.ingress.ja_offentlig')
      ).toBeVisible()
    })

    it('Når brukeren har valgt AFP privat, viser riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<Grunnlag inntekt={{ beloep: 500000, aar: 2021 }} />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            afp: 'ja_privat',
          },
        },
      })
      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(screen.getByText('Privat')).toBeVisible()
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
      render(<Grunnlag inntekt={{ beloep: 500000, aar: 2021 }} />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            afp: 'nei',
          },
        },
      })
      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(screen.getByText('Nei')).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[6])

      expect(await screen.findByText('grunnlag.afp.ingress.nei')).toBeVisible()
    })

    it('Når brukeren har svart "vet ikke" på AFP, viser riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<Grunnlag inntekt={{ beloep: 500000, aar: 2021 }} />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            afp: 'vet_ikke',
          },
        },
      })
      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(screen.getByText('Vet ikke')).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[6])

      expect(
        await screen.findByText('grunnlag.afp.ingress.vet_ikke')
      ).toBeVisible()
    })
  })
})
