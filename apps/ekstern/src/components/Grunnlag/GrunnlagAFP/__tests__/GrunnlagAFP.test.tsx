import * as ReactRouterUtils from 'react-router'

import { GrunnlagAFP } from '..'
import {
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtak75Ufoeregrad,
  fulfilledGetLoependeVedtakLoepende50Alderspensjon,
  fulfilledGetLoependeVedtakLoependeAFPoffentlig,
  fulfilledGetLoependeVedtakLoependeAFPprivat,
} from '@/mocks/mockedRTKQueryApiCalls'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent } from '@/test-utils'

describe('Grunnlag - AFP', () => {
  it('Når brukeren har valgt AFP offentlig og samtykket til beregning av den, viser riktig tittel med formatert inntekt og tekst', async () => {
    const user = userEvent.setup()
    render(<GrunnlagAFP goToStart={vi.fn()} />, {
      preloadedState: {
        api: {
          //@ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
          },
        },
        userInput: {
          ...userInputInitialState,
          afp: 'ja_offentlig',
          samtykkeOffentligAFP: true,
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

  it('Når brukeren har valgt AFP offentlig og ikke samtykket til beregning av den, viser riktig tittel med formatert inntekt og tekst', async () => {
    const user = userEvent.setup()
    render(<GrunnlagAFP goToStart={vi.fn()} />, {
      preloadedState: {
        api: {
          //@ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
          },
        },
        userInput: {
          ...userInputInitialState,
          afp: 'ja_offentlig',
          samtykkeOffentligAFP: false,
        },
      },
    })
    expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
    expect(
      screen.getByText('afp.offentlig (grunnlag.afp.ikke_beregnet)')
    ).toBeVisible()

    const buttons = screen.getAllByRole('button')

    await user.click(buttons[6])

    expect(
      await screen.findByText('grunnlag.afp.ingress.ja_offentlig_utilgjengelig')
    ).toBeVisible()
  })

  it('Når brukeren har valgt AFP privat, viser riktig tittel med formatert inntekt og tekst', async () => {
    const user = userEvent.setup()
    render(<GrunnlagAFP goToStart={vi.fn()} />, {
      preloadedState: {
        api: {
          //@ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
          },
        },
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
      await screen.findByText('Du har oppgitt AFP i privat sektor.', {
        exact: false,
      })
    ).toBeVisible()
  })

  it('Når brukeren har valgt uten AFP, viser riktig tittel med formatert inntekt, tekst og lenke', async () => {
    const goToStartMock = vi.fn()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    const user = userEvent.setup()
    render(<GrunnlagAFP goToStart={goToStartMock} />, {
      preloadedState: {
        api: {
          //@ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
          },
        },
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

    expect(
      await screen.findByText('grunnlag.afp.ingress.nei', { exact: false })
    ).toBeVisible()
    expect(await screen.findByText('grunnlag.afp.reset_link')).toBeVisible()
    await user.click(await screen.findByText('grunnlag.afp.reset_link'))
    expect(goToStartMock).toHaveBeenCalled()
  })

  it('Når brukeren har svart "vet ikke" på AFP, viser riktig tittel med formatert inntekt og tekst', async () => {
    const user = userEvent.setup()
    render(<GrunnlagAFP goToStart={vi.fn()} />, {
      preloadedState: {
        api: {
          //@ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
          },
        },
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

  describe('Gitt at brukeren har uføretrygd,', () => {
    it('Når hen har valgt AFP offentlig, viser riktig tittel med formatert inntekt og tekst', async () => {
      render(<GrunnlagAFP goToStart={vi.fn()} />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...fulfilledGetLoependeVedtak75Ufoeregrad },
          },
          userInput: {
            ...userInputInitialState,
            afp: 'ja_offentlig',
          },
        },
      })

      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(
        screen.getByText('afp.offentlig (grunnlag.afp.ikke_beregnet)')
      ).toBeVisible()
      expect(
        screen.getByText(
          'Når du mottar uføretrygd, kan du ikke beregne AFP i kalkulatoren.',
          { exact: false }
        )
      ).toBeInTheDocument()
    })

    it('Når hen har valgt AFP privat, viser riktig tittel med formatert inntekt og tekst', async () => {
      render(<GrunnlagAFP goToStart={vi.fn()} />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...fulfilledGetLoependeVedtak75Ufoeregrad },
          },
          userInput: {
            ...userInputInitialState,
            afp: 'ja_privat',
          },
        },
      })
      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(
        screen.getByText('afp.privat (grunnlag.afp.ikke_beregnet)')
      ).toBeVisible()
      expect(
        screen.getByText(
          'Når du mottar uføretrygd, kan du ikke beregne AFP i kalkulatoren.',
          { exact: false }
        )
      ).toBeInTheDocument()
    })

    it('Når hen har valgt uten AFP, viser riktig tittel med formatert inntekt og tekst', async () => {
      render(<GrunnlagAFP goToStart={vi.fn()} />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...fulfilledGetLoependeVedtak75Ufoeregrad },
          },
          userInput: {
            ...userInputInitialState,
            afp: 'nei',
          },
        },
      })
      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(screen.getByText('afp.nei')).toBeVisible()
      expect(
        screen.getByText('grunnlag.afp.ingress.nei.ufoeretrygd')
      ).toBeInTheDocument()
    })

    it('Når hen har svart "vet ikke" på AFP, viser riktig tittel med formatert inntekt og tekst', async () => {
      render(<GrunnlagAFP goToStart={vi.fn()} />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...fulfilledGetLoependeVedtak75Ufoeregrad },
          },
          userInput: {
            ...userInputInitialState,
            afp: 'vet_ikke',
          },
        },
      })
      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(screen.getByText('afp.vet_ikke')).toBeVisible()
      expect(
        screen.getByText('grunnlag.afp.ingress.vet_ikke.ufoeretrygd')
      ).toBeInTheDocument()
    })
  })

  describe('Gitt at brukeren har vedtak om alderspensjon,', () => {
    it('Når hen har valgt AFP privat, viser riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<GrunnlagAFP goToStart={vi.fn()} />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...fulfilledGetLoependeVedtakLoepende50Alderspensjon },
          },
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
        await screen.findByText('Du har oppgitt AFP i privat sektor.', {
          exact: false,
        })
      ).toBeVisible()
    })

    it('Når hen har valgt AFP offentlig og samtykket til beregning av den, viser riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<GrunnlagAFP goToStart={vi.fn()} />, {
        preloadedState: {
          api: {
            //@ts-ignore
            queries: {
              ...fulfilledGetLoependeVedtakLoepende50Alderspensjon,
            },
          },
          userInput: {
            ...userInputInitialState,
            afp: 'ja_offentlig',
            samtykkeOffentligAFP: true,
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

    it('Når hen har valgt AFP offentlig og ikke samtykket til beregning av den, viser riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<GrunnlagAFP goToStart={vi.fn()} />, {
        preloadedState: {
          api: {
            //@ts-ignore
            queries: {
              ...fulfilledGetLoependeVedtakLoepende50Alderspensjon,
            },
          },
          userInput: {
            ...userInputInitialState,
            afp: 'ja_offentlig',
            samtykkeOffentligAFP: false,
          },
        },
      })
      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(
        screen.getByText('afp.offentlig (grunnlag.afp.ikke_beregnet)')
      ).toBeVisible()

      const buttons = screen.getAllByRole('button')

      await user.click(buttons[6])

      expect(
        await screen.findByText(
          'grunnlag.afp.ingress.ja_offentlig_utilgjengelig'
        )
      ).toBeVisible()
    })

    it('Når hen har valgt uten AFP, viser riktig tittel med formatert inntekt, tekst og lenke', async () => {
      const goToStartMock = vi.fn()
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )

      const user = userEvent.setup()
      render(<GrunnlagAFP goToStart={goToStartMock} />, {
        preloadedState: {
          api: {
            //@ts-ignore
            queries: {
              ...fulfilledGetLoependeVedtakLoepende50Alderspensjon,
            },
          },
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

      expect(
        await screen.findByText('grunnlag.afp.ingress.nei.endring')
      ).toBeVisible()
      expect(
        screen.queryByText('grunnlag.afp.reset_link')
      ).not.toBeInTheDocument()
    })

    it('Når hen har svart "vet ikke" på AFP, viser riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<GrunnlagAFP goToStart={vi.fn()} />, {
        preloadedState: {
          api: {
            //@ts-ignore
            queries: {
              ...fulfilledGetLoependeVedtakLoepende50Alderspensjon,
            },
          },
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

  describe('Gitt at brukeren har vedtak om AFP-privat,', () => {
    it('hen får ikke velge AFP, og det vises riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<GrunnlagAFP goToStart={vi.fn()} />, {
        preloadedState: {
          api: {
            //@ts-ignore
            queries: {
              ...fulfilledGetLoependeVedtakLoependeAFPprivat,
            },
          },
          userInput: {
            ...userInputInitialState,
            afp: null,
          },
        },
      })
      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(
        screen.getByText('afp.privat (grunnlag.afp.endring)')
      ).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[6])

      expect(
        await screen.findByText('grunnlag.afp.ingress.ja_privat.endring')
      ).toBeVisible()
    })
  })

  describe('Gitt at brukeren har vedtak om AFP-offentlig,', () => {
    it('hen får ikke velge AFP, og det vises riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<GrunnlagAFP goToStart={vi.fn()} />, {
        preloadedState: {
          api: {
            //@ts-ignore
            queries: {
              ...fulfilledGetLoependeVedtakLoependeAFPoffentlig,
            },
          },
          userInput: {
            ...userInputInitialState,
            afp: null,
          },
        },
      })
      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(
        screen.getByText('afp.offentlig (grunnlag.afp.endring)')
      ).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[6])

      expect(
        await screen.findByText('grunnlag.afp.ingress.ja_offentlig.endring')
      ).toBeVisible()
    })
  })
})
