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
        alderspensjonListe={undefined}
        afpPrivatListe={undefined}
        afpOffentligListe={undefined}
        pre2025OffentligAfp={undefined}
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
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6)
    expect(await screen.findByText('grunnlag.title')).toBeInTheDocument()
    expect(
      await screen.findByText('grunnlag2.endre_inntekt.title')
    ).toBeVisible()
    expect(await screen.findByText('grunnlag.sivilstand.title')).toBeVisible()
    expect(
      await screen.findByText('grunnlag.opphold.title.mindre_enn_5_aar')
    ).toBeVisible()
    expect(
      await screen.findByText('beregning.highcharts.serie.alderspensjon.name')
    ).toBeVisible()
    expect(
      await screen.findByText('grunnlag.afp.title', { exact: false })
    ).toBeVisible()
  })

  it('når grunnlag vises i Avansert visning, viser alle seksjonene utenom uttaksgrad og inntekt, i tilleg til forbehold', async () => {
    renderGrunnlagMedPreloadedState('2', 'avansert')
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2)
    expect(
      await screen.findByText('grunnlag.endring.title')
    ).toBeInTheDocument()
    expect(
      screen.queryByText('grunnlag.uttaksgrad.title')
    ).not.toBeInTheDocument()
    expect(screen.queryByText('grunnlag.inntekt.title')).not.toBeInTheDocument()
    expect(await screen.findByText('grunnlag.sivilstand.title')).toBeVisible()
    expect(
      await screen.findByText('grunnlag.opphold.title.mindre_enn_5_aar')
    ).toBeVisible()
    expect(
      await screen.findByText('beregning.highcharts.serie.alderspensjon.name')
    ).toBeVisible()
    expect(
      await screen.findByText('grunnlag.afp.title', { exact: false })
    ).toBeVisible()
  })

  it('viser annen tittel for avansert', async () => {
    renderGrunnlagMedPreloadedState('2', 'avansert')
    expect(
      await screen.findByText('grunnlag.endring.title')
    ).toBeInTheDocument()
  })

  describe('Grunnlag - inntekt frem til uttak', () => {
    it('vises i enkel visning', async () => {
      renderGrunnlagMedPreloadedState('2', 'enkel')
      expect(
        screen.queryByText('grunnlag2.endre_inntekt.title')
      ).toBeInTheDocument()
    })

    it('vises ikke avansert visning', async () => {
      renderGrunnlagMedPreloadedState('2', 'avansert')
      expect(
        screen.queryByText('grunnlag2.endre_inntekt.title')
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

      expect(
        screen.queryByText('grunnlag.sivilstand.title')
      ).toBeInTheDocument()
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
        await screen.findByText('beregning.highcharts.serie.alderspensjon.name')
      ).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[3])

      expect(
        await screen.findByText(
          'Alderspensjon beregnes ut ifra din opptjening i folketrygden',
          { exact: false }
        )
      ).toBeVisible()
    })

    it('viser pensjonsbeholdning når den er oppgitt', async () => {
      const user = userEvent.setup()
      render(
        <Grunnlag
          headingLevel="2"
          visning="enkel"
          pensjonsbeholdning={2345678}
          isEndring={false}
          alderspensjonListe={undefined}
          afpPrivatListe={undefined}
          afpOffentligListe={undefined}
          pre2025OffentligAfp={undefined}
        />,
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
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[3])

      expect(
        await screen.findByText('Din pensjonsopptjening før uttak:', {
          exact: false,
        })
      ).toBeVisible()
    })
  })

  describe('Grunnlag - AFP', () => {
    it('Når brukeren har valgt uten AFP, viser riktig tittel med formatert inntekt, tekst og lenken oppfører seg som forventet', async () => {
      const user = userEvent.setup()
      renderGrunnlagMedPreloadedState('2', 'enkel', {
        ...userInputInitialState,
        afp: 'nei',
      })

      expect(
        screen.getByText('grunnlag.afp.title', { exact: false })
      ).toBeVisible()
      expect(screen.getByText('afp.nei')).toBeVisible()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[4])

      expect(
        await screen.findByTestId('grunnlag.afp.ingress.nei', { exact: false })
      ).toBeVisible()
      expect(await screen.findByTestId('grunnlag.afp.afp_link')).toBeVisible()
      await user.click(await screen.findByTestId('grunnlag.afp.afp_link'))
      expect(navigateMock).toHaveBeenCalledWith(paths.afp)
    })

    describe('Detaljer for pre2025OffentligAfp', () => {
      it('viser AFP avkortet melding og lenke når afpAvkortetTil70Prosent er true', async () => {
        const user = userEvent.setup()
        const mockPre2025OffentligAfp = {
          alderAar: 63,
          totaltAfpBeloep: 29373,
          tidligereArbeidsinntekt: 609000,
          grunnbeloep: 124028,
          sluttpoengtall: 3.91,
          trygdetid: 40,
          poengaarTom1991: 12,
          poengaarFom1992: 28,
          grunnpensjon: 10336,
          tilleggspensjon: 17337,
          afpTillegg: 1700,
          saertillegg: 0,
          afpGrad: 60,
          afpAvkortetTil70Prosent: true,
        }

        render(
          <Grunnlag
            headingLevel="2"
            visning="enkel"
            isEndring={false}
            pre2025OffentligAfp={mockPre2025OffentligAfp}
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
                afp: 'ja_offentlig',
                currentSimulation: {
                  ...userInputInitialState.currentSimulation,
                  uttaksalder: { aar: 67, maaneder: 0 },
                  aarligInntektFoerUttakBeloep: '500000',
                },
              },
            },
          }
        )

        // Click the AFP ReadMore button to expand the details
        const buttons = screen.getAllByRole('button')
        const afpReadMoreButton = buttons.find((button) =>
          button.textContent?.includes('AFP')
        )

        if (afpReadMoreButton) {
          await user.click(afpReadMoreButton)

          expect(
            screen.getByText('grunnlag.afp.avkortet.til.70.prosent')
          ).toBeInTheDocument()

          const navLink = screen.getByRole('link', {
            name: 'grunnlag.afp.link.text',
          })
          expect(navLink).toBeVisible()
          expect(navLink).toHaveAttribute(
            'href',
            'https://www.nav.no/afp-offentlig#beregning'
          )
          expect(navLink).toHaveAttribute('target', '_blank')
          expect(navLink).toHaveAttribute('rel', 'noopener noreferrer')
        }
      })

      it('skjuler AFP avkortet melding og lenke når afpAvkortetTil70Prosent er false', async () => {
        const user = userEvent.setup()
        const mockPre2025OffentligAfp = {
          alderAar: 63,
          totaltAfpBeloep: 29373,
          tidligereArbeidsinntekt: 609000,
          grunnbeloep: 124028,
          sluttpoengtall: 3.91,
          trygdetid: 40,
          poengaarTom1991: 12,
          poengaarFom1992: 28,
          grunnpensjon: 10336,
          tilleggspensjon: 17337,
          afpTillegg: 1700,
          saertillegg: 0,
          afpGrad: 60,
          afpAvkortetTil70Prosent: false,
        }

        render(
          <Grunnlag
            headingLevel="2"
            visning="enkel"
            isEndring={false}
            pre2025OffentligAfp={mockPre2025OffentligAfp}
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
                afp: 'ja_offentlig',
                currentSimulation: {
                  ...userInputInitialState.currentSimulation,
                  uttaksalder: { aar: 67, maaneder: 0 },
                  aarligInntektFoerUttakBeloep: '500000',
                },
              },
            },
          }
        )

        const buttons = screen.getAllByRole('button')
        const afpReadMoreButton = buttons.find((button) =>
          button.textContent?.includes('AFP')
        )

        if (afpReadMoreButton) {
          await user.click(afpReadMoreButton)

          expect(
            screen.queryByText('grunnlag.afp.avkortet.til.70.prosent')
          ).not.toBeInTheDocument()

          expect(
            screen.queryByRole('link', {
              name: 'grunnlag.afp.link.text',
            })
          ).not.toBeInTheDocument()
        }
      })

      it('skjuler AFP avkortet melding og lenke når pre2025OffentligAfp er undefined', async () => {
        const user = userEvent.setup()

        render(
          <Grunnlag
            headingLevel="2"
            visning="enkel"
            isEndring={false}
            pre2025OffentligAfp={undefined}
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
                afp: 'ja_offentlig',
                currentSimulation: {
                  ...userInputInitialState.currentSimulation,
                  uttaksalder: { aar: 67, maaneder: 0 },
                  aarligInntektFoerUttakBeloep: '500000',
                },
              },
            },
          }
        )

        const buttons = screen.getAllByRole('button')
        const afpReadMoreButton = buttons.find((button) =>
          button.textContent?.includes('AFP')
        )

        if (afpReadMoreButton) {
          await user.click(afpReadMoreButton)

          expect(
            screen.queryByText('grunnlag.afp.avkortet.til.70.prosent')
          ).not.toBeInTheDocument()

          expect(
            screen.queryByRole('link', {
              name: 'grunnlag.afp.link.text',
            })
          ).not.toBeInTheDocument()
        }
      })
    })
  })
})
