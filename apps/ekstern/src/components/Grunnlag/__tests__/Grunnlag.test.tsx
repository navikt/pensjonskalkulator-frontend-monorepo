import { Grunnlag } from '@/components/Grunnlag'
import {
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtakLoependeAlderspensjon,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import * as userInputReducerUtils from '@/state/userInput/userInputSlice'
import { render, screen, userEvent, waitFor } from '@/test-utils'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('Grunnlag', () => {
  const renderGrunnlagMedPreloadedState = (
    headingLevel: '1' | '2' | '3',
    visning: 'avansert' | 'enkel',
    userInputState?: userInputReducerUtils.UserInputState,
    pensjonsbeholdning?: number
  ) => {
    render(
      <Grunnlag
        headingLevel={headingLevel}
        visning={visning}
        pensjonsbeholdning={pensjonsbeholdning}
        isEndring={false}
      />,
      {
        preloadedState: {
          api: {
            //@ts-ignore
            queries: {
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            ...userInputState,
          },
        },
      }
    )
  }
  it('når grunnlag vises i Enkel visning, viser alle seksjonene og forbehold', async () => {
    renderGrunnlagMedPreloadedState('3', 'enkel')
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)
    expect(await screen.findByText('grunnlag.title')).toBeInTheDocument()
    expect(await screen.findByText('grunnlag.uttaksgrad.title')).toBeVisible()
    expect(await screen.findByText('grunnlag.inntekt.title')).toBeVisible()
    expect(await screen.findByText('grunnlag.sivilstand.title')).toBeVisible()
    expect(
      await screen.findByText('grunnlag.opphold.title.mindre_enn_5_aar')
    ).toBeVisible()
    expect(
      await screen.findByText('grunnlag.alderspensjon.title')
    ).toBeVisible()
    expect(await screen.findByText('grunnlag.afp.title')).toBeVisible()
  })

  it('når grunnlag vises i Avansert visning, viser alle seksjonene utenom uttaksgrad og inntekt, i tilleg til forbehold', async () => {
    renderGrunnlagMedPreloadedState('2', 'avansert')
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
    expect(await screen.findByText('grunnlag.title')).toBeInTheDocument()
    expect(
      screen.queryByText('grunnlag.uttaksgrad.title')
    ).not.toBeInTheDocument()
    expect(screen.queryByText('grunnlag.inntekt.title')).not.toBeInTheDocument()
    expect(await screen.findByText('grunnlag.sivilstand.title')).toBeVisible()
    expect(
      await screen.findByText('grunnlag.opphold.title.mindre_enn_5_aar')
    ).toBeVisible()
    expect(
      await screen.findByText('grunnlag.alderspensjon.title')
    ).toBeVisible()
    expect(await screen.findByText('grunnlag.afp.title')).toBeVisible()
  })

  it('viser annen tittel for avansert', async () => {
    renderGrunnlagMedPreloadedState('2', 'avansert')
    expect(await screen.findByText('grunnlag.title')).toBeInTheDocument()
  })

  describe('Grunnlag - inntekt frem til uttak', () => {
    it('vises i enkel visning', async () => {
      renderGrunnlagMedPreloadedState('2', 'enkel')
      expect(screen.queryByText('grunnlag.inntekt.title')).toBeInTheDocument()
    })

    it('vises ikke avansert visning', async () => {
      renderGrunnlagMedPreloadedState('2', 'avansert')
      expect(
        screen.queryByText('grunnlag.inntekt.title')
      ).not.toBeInTheDocument()
    })
  })

  describe('Grunnlag - uttaksgrad', () => {
    it('viser riktig tittel med formatert uttaksgrad og tekst', async () => {
      const user = userEvent.setup()
      renderGrunnlagMedPreloadedState('2', 'enkel')
      expect(screen.getByText('grunnlag.uttaksgrad.title')).toBeVisible()
      expect(screen.getAllByText('100 %')).toHaveLength(3)
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[1])

      expect(
        await screen.findByText('Denne beregningen viser', { exact: false })
      ).toBeVisible()
    })

    it('brukeren kan gå til avansert fane og starte en ny beregning', async () => {
      const flushCurrentSimulationMock = vi.spyOn(
        userInputReducerUtils.userInputActions,
        'flushCurrentSimulation'
      )

      const user = userEvent.setup()
      renderGrunnlagMedPreloadedState('2', 'enkel')
      expect(screen.getByText('grunnlag.uttaksgrad.title')).toBeVisible()
      expect(screen.getAllByText('100 %')).toHaveLength(3)
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[1])
      await user.click(
        await screen.findByText('grunnlag.uttaksgrad.avansert_link')
      )
      expect(flushCurrentSimulationMock).toHaveBeenCalled()
      expect(navigateMock).toHaveBeenCalledWith(paths.beregningAvansert)
    })

    it('vises ikke ikke avansert visning', async () => {
      renderGrunnlagMedPreloadedState('2', 'avansert')
      expect(
        screen.queryByText('grunnlag.uttaksgrad.title')
      ).not.toBeInTheDocument()
    })
  })

  describe('Grunnlag - sivilstand', () => {
    it('viser riktig tekst og lenke når henting av sivilstand fra vedtaket er vellykket', async () => {
      const user = userEvent.setup()

      render(
        <Grunnlag headingLevel="2" visning="avansert" isEndring={false} />,
        {
          preloadedState: {
            api: {
              //@ts-ignore
              queries: {
                ...fulfilledGetLoependeVedtakLoependeAlderspensjon,
              },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )

      expect(
        await screen.findByText('grunnlag.sivilstand.title')
      ).toBeInTheDocument()
      expect(await screen.findByText('sivilstand.UGIFT')).toBeInTheDocument()
      await waitFor(async () => {
        expect(
          screen.queryByText('grunnlag.sivilstand.title.error')
        ).not.toBeInTheDocument()
      })
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[3])

      expect(
        await screen.findByText(
          'Hvis du bor sammen med noen kan inntekten til den du bor med ha betydning for hva du får i alderspensjon.',
          { exact: false }
        )
      ).toBeVisible()
    })

    it('viser riktig tekst og lenke når henting av sivilstand fra person er vellykket', async () => {
      const user = userEvent.setup()
      mockResponse('/v4/person', {
        status: 200,
        json: {
          navn: 'Ola',
          sivilstand: 'GIFT',
          foedselsdato: '1963-04-30',
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
      })
      renderGrunnlagMedPreloadedState('2', 'avansert', {
        ...userInputInitialState,
        sivilstand: 'GIFT',
      })

      expect(
        await screen.findByText('grunnlag.sivilstand.title')
      ).toBeInTheDocument()
      expect(await screen.findByText('sivilstand.GIFT')).toBeInTheDocument()
      await waitFor(async () => {
        expect(
          screen.queryByText('grunnlag.sivilstand.title.error')
        ).not.toBeInTheDocument()
      })
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[3])

      expect(
        await screen.findByText(
          'Hvis du bor sammen med noen kan inntekten til den du bor med ha betydning for hva du får i alderspensjon.',
          { exact: false }
        )
      ).toBeVisible()
    })

    it('viser riktig tekst og lenke når brukeren har oppgitt samboerskap manuelt', async () => {
      const user = userEvent.setup()
      mockResponse('/v4/person', {
        status: 200,
        json: {
          navn: 'Ola',
          sivilstand: 'UGIFT',
          foedselsdato: '1963-04-30',
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
      })

      renderGrunnlagMedPreloadedState('2', 'enkel', {
        ...userInputInitialState,
        sivilstand: 'UGIFT',
      })

      expect(
        await screen.findByText('grunnlag.sivilstand.title')
      ).toBeInTheDocument()
      expect(await screen.findByText('sivilstand.UGIFT')).toBeVisible()
      expect(
        screen.queryByText('grunnlag.sivilstand.title.error')
      ).not.toBeInTheDocument()
      const buttons = screen.getAllByRole('button')
      await user.click(buttons[3])

      expect(
        await screen.findByText(
          'Hvis du bor sammen med noen kan inntekten til den du bor med ha betydning for hva du får i alderspensjon.',
          { exact: false }
        )
      ).toBeVisible()
    })

    it('viser feilmelding når henting av personopplysninger feiler', async () => {
      const user = userEvent.setup()
      mockErrorResponse('/v4/person')
      renderGrunnlagMedPreloadedState('2', 'enkel')

      await waitFor(() => {
        expect(
          screen.queryByText('grunnlag.sivilstand.title')
        ).toBeInTheDocument()
      })
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[3])

      expect(
        await screen.findByText(
          'Hvis du bor sammen med noen kan inntekten til den du bor med ha betydning for hva du får i alderspensjon.',
          { exact: false }
        )
      ).toBeVisible()
    })
  })

  describe('Grunnlag - utenlandsopphold', () => {
    it('viser riktig tittel og tekst', async () => {
      renderGrunnlagMedPreloadedState('2', 'enkel')
      expect(
        screen.getByText('grunnlag.opphold.title.mindre_enn_5_aar')
      ).toBeVisible()
      expect(
        screen.getByText('grunnlag.opphold.value.mindre_enn_5_aar')
      ).toBeVisible()
    })
  })

  describe('Grunnlag - alderspensjon', () => {
    it('viser riktig tittel', async () => {
      const user = userEvent.setup()
      renderGrunnlagMedPreloadedState('2', 'enkel')
      expect(
        await screen.findByText('grunnlag.alderspensjon.title')
      ).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[5])

      expect(
        await screen.findByText('grunnlag.alderspensjon.ingress')
      ).toBeVisible()
    })

    it('viser pensjonsbeholdning når den er oppgitt', async () => {
      const user = userEvent.setup()
      renderGrunnlagMedPreloadedState('2', 'enkel', undefined, 2345678)
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[5])

      expect(
        await screen.findByText('Din pensjonsbeholdning før uttak:', {
          exact: false,
        })
      ).toBeVisible()
    })
  })

  describe('Grunnlag - AFP', () => {
    it('Når brukeren har valgt uten AFP, viser riktig tittel med formatert inntekt, tekst og lenken oppfører seg som forventet', async () => {
      const flushMock = vi.spyOn(
        userInputReducerUtils.userInputActions,
        'flush'
      )

      const user = userEvent.setup()
      renderGrunnlagMedPreloadedState('2', 'enkel', {
        ...userInputInitialState,
        afp: 'nei',
      })

      expect(screen.getByText('grunnlag.afp.title')).toBeVisible()
      expect(screen.getByText('afp.nei')).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[6])

      expect(
        await screen.findByTestId('grunnlag.afp.ingress.nei', { exact: false })
      ).toBeVisible()
      expect(await screen.findByTestId('grunnlag.afp.reset_link')).toBeVisible()
      await user.click(await screen.findByTestId('grunnlag.afp.reset_link'))
      expect(flushMock).toHaveBeenCalled()
      expect(navigateMock).toHaveBeenCalledWith(paths.start)
    })
  })
})
