import { describe, it } from 'vitest'

import { TidligstMuligUttaksalder } from '..'
import { fulfilledGetPerson } from '@/mocks/mockedRTKQueryApiCalls'
import {
  fulfilledGetOmstillingsstoenadOgGjenlevende,
  fulfilledGetPersonMedOekteAldersgrenser,
} from '@/mocks/mockedRTKQueryApiCalls'
import { paths } from '@/router/constants'
import * as userInputReducerUtils from '@/state/userInput/userInputReducer'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, waitFor, userEvent } from '@/test-utils'
import { loggerTeardown } from '@/utils/__tests__/logging-stub'

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
    it('når tidligstMuligUttak ikke kunne hentes, vises riktig introduksjonstekst og readmore nederst har riktig tekst.', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={undefined}
          ufoeregrad={0}
          show1963Text={false}
        />,
        {
          preloadedState: {
            api: {
              //@ts-ignore
              queries: {
                ...fulfilledGetPerson,
              },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )

      expect(screen.getByText('tidligstmuliguttak.error')).toBeInTheDocument()
      expect(
        screen.getByText('beregning.read_more.pensjonsalder.label')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('beregning.read_more.pensjonsalder.body.optional', {
          exact: false,
        })
      ).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'Aldersgrensene vil øke gradvis fra 1964-kullet med én til to måneder per årskull, men dette tar ikke pensjonskalkulatoren høyde for.',
          {
            exact: false,
          }
        )
      ).toBeInTheDocument()
      expect(
        screen.queryByText(
          'tidligstmuliguttak.info_omstillingsstoenad_og_gjenlevende'
        )
      ).not.toBeInTheDocument()
    })

    it('når tidligstMuligUttak kunne hentes, vises readmore nederst med riktig tekst.', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={{ aar: 65, maaneder: 3 }}
          ufoeregrad={0}
          show1963Text={false}
        />,
        {
          preloadedState: {
            api: {
              //@ts-ignore
              queries: {
                ...fulfilledGetPerson,
              },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )
      expect(
        screen.queryByText('tidligstmuliguttak.error')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('beregning.read_more.pensjonsalder.label')
      ).toBeInTheDocument()
      expect(
        screen.getByText('beregning.read_more.pensjonsalder.body.optional', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Beregningen din viser at du kan ta ut', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Aldersgrensene vil øke gradvis fra 1964-kullet med én til to måneder per årskull, men dette tar ikke pensjonskalkulatoren høyde for.',
          {
            exact: false,
          }
        )
      ).toBeInTheDocument()
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
            api: {
              //@ts-ignore
              queries: {
                ...fulfilledGetPerson,
              },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )
      await waitFor(() => {
        expect(
          screen.getByText('beregning.read_more.pensjonsalder.body.optional', {
            exact: false,
          })
        ).toBeInTheDocument()
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
        screen.getByText('beregning.read_more.pensjonsalder.label')
      ).toBeInTheDocument()
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
            api: {
              //@ts-ignore
              queries: {
                ...fulfilledGetPerson,
              },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )
      await waitFor(() => {
        expect(
          screen.getByText('beregning.read_more.pensjonsalder.body.optional', {
            exact: false,
          })
        ).toBeInTheDocument()
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
        screen.getByText('beregning.read_more.pensjonsalder.label')
      ).toBeInTheDocument()
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
            api: {
              // @ts-ignore
              queries: {
                ...fulfilledGetOmstillingsstoenadOgGjenlevende,
                ...fulfilledGetPersonMedOekteAldersgrenser,
              },
            },
            userInput: { ...userInputReducerUtils.userInputInitialState },
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

  describe('Gitt at en bruker ikke mottar uføretrygd, ', () => {
    it('når tidligstMuligUttak ikke kunne hentes, vises ikke noe feilmelding og readmore nederst har riktig tekst.', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={undefined}
          ufoeregrad={100}
          show1963Text={false}
        />,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: { ...fulfilledGetPersonMedOekteAldersgrenser },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )

      expect(
        screen.queryByText('tidligstmuliguttak.error')
      ).not.toBeInTheDocument()

      expect(
        screen.queryByText('beregning.read_more.pensjonsalder.label')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('omufoeretrygd.readmore.title')
      ).toBeInTheDocument()
      expect(
        screen.queryByText(
          'tidligstmuliguttak.info_omstillingsstoenad_og_gjenlevende'
        )
      ).not.toBeInTheDocument()
    })

    it('viser riktig innhold med 100 % ufoeretrygd.', async () => {
      const user = userEvent.setup()
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={undefined}
          ufoeregrad={100}
          show1963Text={false}
        />,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: { ...fulfilledGetPersonMedOekteAldersgrenser },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )
      expect(
        await screen.findByText(
          'Kommende lovendringer vil gradvis øke pensjonsalderen for dem som er født i 1964 eller senere.',
          {
            exact: false,
          }
        )
      ).toBeVisible()
      await user.click(screen.getByText('omufoeretrygd.readmore.title'))
      expect(
        screen.getByText(
          'uføretrygd kan ikke kombineres med alderspensjon. Det er derfor ikke mulig å beregne alderspensjon før',
          { exact: false }
        )
      ).toBeInTheDocument()
    })

    it('viser riktig innhold med gradert ufoeretrygd.', async () => {
      const flushCurrentSimulationMock = vi.spyOn(
        userInputReducerUtils.userInputActions,
        'flushCurrentSimulationUtenomUtenlandsperioder'
      )

      const user = userEvent.setup()
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={undefined}
          ufoeregrad={75}
          show1963Text={false}
        />,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: { ...fulfilledGetPersonMedOekteAldersgrenser },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )
      expect(
        await screen.findByText('Vil du beregne uttak før ', {
          exact: false,
        })
      ).toBeVisible()
      await user.click(screen.getByText('omufoeretrygd.readmore.title'))
      expect(
        screen.getByText(
          'Det er mulig å kombinere gradert uføretrygd og gradert alderspensjon fra',
          { exact: false }
        )
      ).toBeInTheDocument()
      await user.click(screen.getByText('omufoeretrygd.avansert_link'))
      expect(flushCurrentSimulationMock).toHaveBeenCalled()
      expect(navigateMock).toHaveBeenCalledWith(paths.beregningAvansert)
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
            api: {
              // @ts-ignore
              queries: {
                ...fulfilledGetOmstillingsstoenadOgGjenlevende,
                ...fulfilledGetPersonMedOekteAldersgrenser,
              },
            },
            userInput: { ...userInputReducerUtils.userInputInitialState },
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
  })
})
