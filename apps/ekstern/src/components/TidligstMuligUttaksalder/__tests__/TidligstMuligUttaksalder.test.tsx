import { describe, it } from 'vitest'

import {
  loependeVedtak75UfoeregradMock,
  omstillingsstoenadOgGjenlevendeMock,
  personMedOekteAldersgrenseMock,
  personMock,
} from '@/mocks'
import * as userInputReducerUtils from '@/state/userInput/userInputSlice'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, waitFor } from '@/test-utils'
import { loggerTeardown } from '@/utils/__tests__/logging-stub'

import { TidligstMuligUttaksalder } from '..'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('TidligstMuligUttaksalder', () => {
  afterEach(() => {
    loggerTeardown()
  })

  describe('Gitt at en bruker ikke mottar uføretrygd, ', () => {
    it('vises riktig introduksjonstekst og readmore nederst har riktig tekst.', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={undefined}
          ufoeregrad={0}
          show1963Text={false}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
            },
          },
          preloadedApiState: { getPerson: personMock },
        }
      )

      expect(screen.getByText('tidligstmuliguttak.error')).toBeInTheDocument()
      await waitFor(() => {
        expect(screen.getByTestId('om_TMU')).toBeVisible()
      })
      expect(
        screen.queryByText(
          'tidligstmuliguttak.info_omstillingsstoenad_og_gjenlevende'
        )
      ).not.toBeInTheDocument()
    })

    it('når brukeren er født etter 1963, vises riktig ingress.', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
          ufoeregrad={0}
          show1963Text={false}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
            },
          },
          preloadedApiState: { getPerson: personMock },
        }
      )
      await waitFor(() => {
        expect(screen.getByTestId('om_TMU')).toBeInTheDocument()
        expect(
          screen.getByText('Beregningen din viser at du kan ta ut', {
            exact: false,
          })
        ).toBeInTheDocument()
        expect(
          screen.getByText('62 alder.aar string.og 9 alder.maaneder', {
            exact: false,
          })
        ).toBeInTheDocument()
        expect(
          screen.queryByText('tidligstmuliguttak.1963.ingress_2')
        ).not.toBeInTheDocument()
        expect(
          screen.getByText('tidligstmuliguttak.1964.ingress_2')
        ).toBeInTheDocument()
      })
      expect(
        screen.queryByText(
          'tidligstmuliguttak.info_omstillingsstoenad_og_gjenlevende'
        )
      ).not.toBeInTheDocument()
    })

    it('når brukeren er født i 1963, vises riktig ingress.', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
          ufoeregrad={0}
          show1963Text={true}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
            },
          },
          preloadedApiState: { getPerson: personMock },
        }
      )
      await waitFor(() => {
        expect(screen.getByTestId('om_TMU')).toBeInTheDocument()
        expect(
          screen.getByText('Beregningen din viser at du kan ta ut', {
            exact: false,
          })
        ).toBeInTheDocument()
        expect(
          screen.getByText('62 alder.aar string.og 9 alder.maaneder', {
            exact: false,
          })
        ).toBeInTheDocument()
        expect(
          screen.getByText('tidligstmuliguttak.1963.ingress_2')
        ).toBeInTheDocument()
        expect(
          screen.queryByText('tidligstmuliguttak.1964.ingress_2')
        ).not.toBeInTheDocument()
      })
      expect(
        screen.queryByText(
          'tidligstmuliguttak.info_omstillingsstoenad_og_gjenlevende'
        )
      ).not.toBeInTheDocument()
    })

    it('når brukeren har loependeVedtakPre2025OffentligAfp vises riktig ingress.', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
          ufoeregrad={0}
          show1963Text={false}
          loependeVedtakPre2025OffentligAfp={true}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
            },
          },
          preloadedApiState: { getPerson: personMock },
        }
      )
      expect(
        await screen.findByTestId(
          'tidligstmuliguttak.pre2025OffentligAfp.ingress'
        )
      ).toBeInTheDocument()
    })

    it('når brukeren er over 75 år, vises riktig ingress.', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
          ufoeregrad={0}
          show1963Text={true}
          isOver75AndNoLoependeVedtak={true}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
            },
          },
          preloadedApiState: { getPerson: personMock },
        }
      )
      await waitFor(() => {
        expect(screen.getByTestId('om_TMU')).toBeInTheDocument()
        expect(
          screen.getByText('Beregningen din viser at du kan ta ut', {
            exact: false,
          })
        ).toBeInTheDocument()
        expect(
          screen.getByText('62 alder.aar string.og 9 alder.maaneder', {
            exact: false,
          })
        ).toBeInTheDocument()

        expect(
          screen.queryByText('tidligstmuliguttak.1963.ingress_2')
        ).not.toBeInTheDocument()
        expect(
          screen.queryByText('tidligstmuliguttak.1964.ingress_2')
        ).not.toBeInTheDocument()
      })
      expect(
        screen.queryByText(
          'tidligstmuliguttak.info_omstillingsstoenad_og_gjenlevende'
        )
      ).not.toBeInTheDocument()
    })

    it('når brukeren mottar omstillingsstønad eller gjenlevendepensjon, vises riktig alertboks.', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
          ufoeregrad={0}
          show1963Text={false}
        />,
        {
          preloadedState: {
            userInput: { ...userInputReducerUtils.userInputInitialState },
          },
          preloadedApiState: {
            getOmstillingsstoenadOgGjenlevende:
              omstillingsstoenadOgGjenlevendeMock,
            getPerson: personMedOekteAldersgrenseMock,
          },
        }
      )

      await waitFor(() => {
        expect(
          screen.getByText(
            'Alderspensjon kan ikke kombineres med gjenlevendepensjon eller omstillingsstønad.',
            { exact: false }
          )
        ).toBeInTheDocument()
      })
    })
  })

  describe('Gitt at en bruker mottar uføretrygd, ', () => {
    it('når tidligstMuligUttak ikke kunne hentes, vises ikke noe feilmelding og readmore nederst har riktig tekst.', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={undefined}
          ufoeregrad={100}
          show1963Text={false}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
            },
          },
          preloadedApiState: { getPerson: personMedOekteAldersgrenseMock },
        }
      )

      expect(
        screen.queryByText('tidligstmuliguttak.error')
      ).not.toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByTestId('om_pensjonsalder_UT_hel')).toBeVisible()
      })
      expect(
        screen.queryByText(
          'tidligstmuliguttak.info_omstillingsstoenad_og_gjenlevende'
        )
      ).not.toBeInTheDocument()
    })

    it('viser riktig innhold med 100 % ufoeretrygd.', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={undefined}
          ufoeregrad={100}
          show1963Text={false}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
            },
          },
          preloadedApiState: { getPerson: personMedOekteAldersgrenseMock },
        }
      )
      // Check for the data-testid for the ReadMore component when Sanity is enabled
      await waitFor(() => {
        expect(screen.getByTestId('om_pensjonsalder_UT_hel')).toBeVisible()
      })
    })

    it('viser riktig innhold med gradert ufoeretrygd.', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={undefined}
          ufoeregrad={75}
          show1963Text={false}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
            },
          },
          preloadedApiState: { getPerson: personMedOekteAldersgrenseMock },
        }
      )
      // Check for the data-testid for the ReadMore component when Sanity is enabled
      await waitFor(() => {
        expect(
          screen.getByTestId('om_pensjonsalder_UT_gradert_enkel')
        ).toBeVisible()
      })
    })

    it('når brukeren mottar omstillingsstønad eller gjenlevendepensjon, vises riktig alertboks.', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
          ufoeregrad={75}
          show1963Text={false}
        />,
        {
          preloadedState: {
            userInput: { ...userInputReducerUtils.userInputInitialState },
          },
          preloadedApiState: {
            getOmstillingsstoenadOgGjenlevende:
              omstillingsstoenadOgGjenlevendeMock,
            getPerson: personMedOekteAldersgrenseMock,
          },
        }
      )

      await waitFor(() => {
        expect(
          screen.getByText(
            'Alderspensjon kan ikke kombineres med gjenlevendepensjon eller omstillingsstønad',
            { exact: false }
          )
        ).toBeInTheDocument()
      })
    })

    it('viser riktig ingress med gradert ufoeretrygd når AFP er valgt.', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={undefined}
          ufoeregrad={75}
          show1963Text={false}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
              afp: 'ja_privat',
            },
          },
          preloadedApiState: {
            getPerson: personMedOekteAldersgrenseMock,
            getLoependeVedtak: loependeVedtak75UfoeregradMock,
          },
        }
      )
      await waitFor(() => {
        expect(
          screen.getByText(
            'kan du beregne kombinasjoner av alderspensjon og uføretrygd før',
            { exact: false }
          )
        ).toBeVisible()
      })
    })
  })
})
