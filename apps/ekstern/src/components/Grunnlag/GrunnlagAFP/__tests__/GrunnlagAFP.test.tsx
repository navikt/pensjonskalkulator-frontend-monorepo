import { add, endOfDay, format } from 'date-fns'

import { Accordion } from '@navikt/ds-react'

import {
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtak75Ufoeregrad,
  fulfilledGetLoependeVedtak100Ufoeregrad,
  fulfilledGetLoependeVedtakLoepende50Alderspensjon,
  fulfilledGetLoependeVedtakLoependeAFPoffentlig,
  fulfilledGetLoependeVedtakLoependeAFPprivat,
  fulfilledGetLoependeVedtakPre2025OffentligAfp,
} from '@/mocks/mockedRTKQueryApiCalls'
import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, userEvent } from '@/test-utils'
import { DATE_BACKEND_FORMAT } from '@/utils/dates'

import { GrunnlagAFP } from '..'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

const WrappedGrunnlagAFP = () => (
  <Accordion>
    <GrunnlagAFP />
  </Accordion>
)

describe('Grunnlag - AFP', () => {
  it('Når brukeren har valgt AFP offentlig og samtykket til beregning av den, viser riktig tittel med formatert inntekt og tekst', async () => {
    const user = userEvent.setup()
    render(<WrappedGrunnlagAFP />, {
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
    render(<WrappedGrunnlagAFP />, {
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
      await screen.findByTestId(
        'grunnlag.afp.ingress.ja_offentlig_utilgjengelig'
      )
    ).toBeVisible()
  })

  it('Når brukeren har valgt AFP privat, viser riktig tittel med formatert inntekt og tekst', async () => {
    const user = userEvent.setup()
    render(<WrappedGrunnlagAFP />, {
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
    const user = userEvent.setup()
    render(<WrappedGrunnlagAFP />, {
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

    expect(await screen.findByTestId('grunnlag.afp.ingress.nei')).toBeVisible()
    expect(await screen.findByTestId('grunnlag.afp.afp_link')).toBeVisible()
    await user.click(await screen.findByTestId('grunnlag.afp.afp_link'))
    expect(navigateMock).toHaveBeenCalledWith(paths.afp)
  })

  it('Når brukeren har svart "vet ikke" på AFP, viser riktig tittel med formatert inntekt og tekst', async () => {
    const user = userEvent.setup()
    render(<WrappedGrunnlagAFP />, {
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
      await screen.findByText(
        'Hvis du er usikker på om du har AFP bør du spørre arbeidsgiveren din.',
        {
          exact: false,
        }
      )
    ).toBeVisible()
  })

  describe('Gitt at brukeren har gradert uføretrygd,', () => {
    describe('Når brukeren er eldre enn AFP-Uføre oppsigelsesalder,', () => {
      const mockedQueries = {
        ...fulfilledGetLoependeVedtak75Ufoeregrad,
        ['getPerson(undefined)']: {
          status: 'fulfilled',
          endpointName: 'getPerson',
          requestId: 'xTaE6mOydr5ZI75UXq4Wi',
          startedTimeStamp: 1688046411971,
          data: {
            navn: 'Aprikos',
            sivilstand: 'UGIFT',
            foedselsdato: '1963-01-01',
            pensjoneringAldre: {
              normertPensjoneringsalder: {
                aar: 67,
                maaneder: 0,
              },
              nedreAldersgrense: {
                aar: 62,
                maaneder: 0,
              },
            },
          },
          fulfilledTimeStamp: 1688046412103,
        },
      }

      it('Skal riktig tittel og tekst vises', async () => {
        render(<WrappedGrunnlagAFP />, {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: { ...mockedQueries },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        })

        expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
        expect(screen.getByText('afp.nei')).toBeVisible()
        expect(
          screen.getByText(
            'For å ha rett til AFP, må du være ansatt i offentlig sektor eller i en bedrift med AFP-ordning i privat sektor. Det gjelder de siste årene og helt fram til du tar ut AFP. Hvis du mottar full uføretrygd, har du derfor normalt ikke rett til AFP.',
            { exact: false }
          )
        ).toBeInTheDocument()
      })
    })

    describe('Når brukeren er yngre enn AFP-Uføre oppsigelsesalder,', () => {
      const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
        years: -61,
        months: -11,
      })
      const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)

      const mockedQueries = {
        ...fulfilledGetLoependeVedtak75Ufoeregrad,
        ['getPerson(undefined)']: {
          status: 'fulfilled',
          endpointName: 'getPerson',
          requestId: 'xTaE6mOydr5ZI75UXq4Wi',
          startedTimeStamp: 1688046411971,
          data: {
            navn: 'Aprikos',
            sivilstand: 'UGIFT',
            foedselsdato,
            pensjoneringAldre: {
              normertPensjoneringsalder: {
                aar: 67,
                maaneder: 0,
              },
              nedreAldersgrense: {
                aar: 62,
                maaneder: 0,
              },
            },
          },
          fulfilledTimeStamp: 1688046412103,
        },
      }

      it('Skal riktig tittel med formatert inntekt og tekst vises når brukeren har valgt AFP offentlig', async () => {
        render(<WrappedGrunnlagAFP />, {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: { ...mockedQueries },
            },
            userInput: {
              ...userInputInitialState,
              afp: 'ja_offentlig',
              samtykkeOffentligAFP: true,
            },
          },
        })

        expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
        expect(
          screen.getByText('afp.offentlig (grunnlag.afp.ikke_beregnet)')
        ).toBeVisible()
        expect(
          screen.getByText(
            'AFP og uføretrygd kan ikke kombineres, og får du utbetalt uføretrygd etter at du fyller 62 år mister du retten til AFP.',
            { exact: false }
          )
        ).toBeInTheDocument()
      })

      it('Skal riktig tittel med formatert inntekt og tekst vises når brukeren har valgt AFP privat', async () => {
        render(<WrappedGrunnlagAFP />, {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: { ...mockedQueries },
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
            'AFP og uføretrygd kan ikke kombineres, og får du utbetalt uføretrygd etter at du fyller 62 år mister du retten til AFP.',
            { exact: false }
          )
        ).toBeInTheDocument()
      })

      it('Skal riktig tittel med formatert inntekt og tekst vises når brukeren har valgt uten AFP', async () => {
        render(<WrappedGrunnlagAFP />, {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: { ...mockedQueries },
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
          screen.getByText('Du har svart at du ikke har rett til AFP.', {
            exact: false,
          })
        ).toBeInTheDocument()
      })

      it('Skal riktig tittel med formatert inntekt og tekst vises når brukeren har valgt "vet ikke" på AFP', async () => {
        render(<WrappedGrunnlagAFP />, {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: { ...mockedQueries },
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
  })

  describe('Gitt at brukeren har 100% uføretrygd,', () => {
    it('Viser riktig tittel og tekst', () => {
      const mockedQueries = {
        ...fulfilledGetLoependeVedtak100Ufoeregrad,
        ['getPerson(undefined)']: {
          status: 'fulfilled',
          endpointName: 'getPerson',
          requestId: 'xTaE6mOydr5ZI75UXq4Wi',
          startedTimeStamp: 1688046411971,
          data: {
            navn: 'Aprikos',
            sivilstand: 'UGIFT',
            foedselsdato: '1965-01-01',
            pensjoneringAldre: {
              normertPensjoneringsalder: {
                aar: 67,
                maaneder: 0,
              },
              nedreAldersgrense: {
                aar: 62,
                maaneder: 0,
              },
            },
          },
          fulfilledTimeStamp: 1688046412103,
        },
      }
      render(<WrappedGrunnlagAFP />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...mockedQueries },
          },
          userInput: { ...userInputInitialState },
        },
      })

      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(screen.getByText('afp.nei')).toBeVisible()
      expect(
        screen.getByText(
          'For å ha rett til AFP, må du være ansatt i offentlig sektor eller i en bedrift med AFP-ordning i privat sektor. Det gjelder de siste årene og helt fram til du tar ut AFP. Hvis du mottar full uføretrygd, har du derfor normalt ikke rett til AFP.',
          { exact: false }
        )
      ).toBeInTheDocument()
    })
  })

  describe('Gitt at brukeren har vedtak om alderspensjon,', () => {
    it('Når hen har valgt AFP privat, viser riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<WrappedGrunnlagAFP />, {
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
      render(<WrappedGrunnlagAFP />, {
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
      render(<WrappedGrunnlagAFP />, {
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
        await screen.findByTestId(
          'grunnlag.afp.ingress.ja_offentlig_utilgjengelig'
        )
      ).toBeVisible()
    })

    it('Når hen har valgt uten AFP, viser riktig tittel med formatert inntekt, tekst og lenke', async () => {
      const user = userEvent.setup()
      render(<WrappedGrunnlagAFP />, {
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
        await screen.findByText('Du har svart at du ikke har rett til AFP.', {
          exact: false,
        })
      ).toBeVisible()
      expect(
        screen.queryByText('grunnlag.afp.reset_link')
      ).not.toBeInTheDocument()
    })

    it('Når hen har svart "vet ikke" på AFP, viser riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<WrappedGrunnlagAFP />, {
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
        await screen.findByText(
          'Hvis du er usikker på om du har AFP bør du spørre arbeidsgiveren din.',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })
  })

  describe('Gitt at brukeren har vedtak om AFP-privat,', () => {
    it('hen får ikke velge AFP, og det vises riktig tittel med formatert inntekt og tekst', async () => {
      const user = userEvent.setup()
      render(<WrappedGrunnlagAFP />, {
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
      render(<WrappedGrunnlagAFP />, {
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

  describe('Gitt at brukeren er født før 1963,', () => {
    it('får brukeren riktig tittel og tekst når hen har vedtak om gradert uføretrygd,', () => {
      const mockedQueries = {
        ...fulfilledGetLoependeVedtak75Ufoeregrad,
        ['getPerson(undefined)']: {
          status: 'fulfilled',
          endpointName: 'getPerson',
          requestId: 'xTaE6mOydr5ZI75UXq4Wi',
          startedTimeStamp: 1688046411971,
          data: {
            navn: 'Aprikos',
            sivilstand: 'UGIFT',
            foedselsdato: '1960-01-01',
            pensjoneringAldre: {
              normertPensjoneringsalder: {
                aar: 67,
                maaneder: 0,
              },
              nedreAldersgrense: {
                aar: 62,
                maaneder: 0,
              },
            },
          },
          fulfilledTimeStamp: 1688046412103,
        },
      }
      render(<WrappedGrunnlagAFP />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...mockedQueries },
          },
          userInput: { ...userInputInitialState },
        },
      })

      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(screen.getByText('afp.nei')).toBeVisible()
      expect(
        screen.getByText(
          'Når du mottar uføretrygd eller alderspensjon kan du ikke beregne AFP i kalkulatoren.',
          { exact: false }
        )
      ).toBeInTheDocument()
    })

    it('får brukeren riktig tittel og tekst når hen har vedtak om AFP etterfulgt av AP,', () => {
      const mockedQueries = {
        ...fulfilledGetLoependeVedtakPre2025OffentligAfp,
        ['getPerson(undefined)']: {
          status: 'fulfilled',
          endpointName: 'getPerson',
          requestId: 'xTaE6mOydr5ZI75UXq4Wi',
          startedTimeStamp: 1688046411971,
          data: {
            navn: 'Aprikos',
            sivilstand: 'UGIFT',
            foedselsdato: '1960-01-01',
            pensjoneringAldre: {
              normertPensjoneringsalder: {
                aar: 67,
                maaneder: 0,
              },
              nedreAldersgrense: {
                aar: 62,
                maaneder: 0,
              },
            },
          },
          fulfilledTimeStamp: 1688046412103,
        },
      }
      render(<WrappedGrunnlagAFP />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...mockedQueries },
          },
          userInput: { ...userInputInitialState },
        },
      })

      expect(
        screen.getByText('grunnlag.afp.ingress.overgangskull')
      ).toBeVisible()
      expect(screen.getByText('afp.offentlig')).toBeVisible()
    })
  })
})
