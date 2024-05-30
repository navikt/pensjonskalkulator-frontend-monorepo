import * as ReactRouterUtils from 'react-router'

import { describe, it } from 'vitest'

import { TidligstMuligUttaksalder } from '..'
import { fullfilledGetOmstillingsstoenadOgGjenlevende } from '@/mocks/mockedRTKQueryApiCalls'
import { paths } from '@/router/constants'
import * as userInputReducerUtils from '@/state/userInput/userInputReducer'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, waitFor, userEvent } from '@/test-utils'
import { loggerTeardown } from '@/utils/__tests__/logging-stub'

describe('TidligstMuligUttaksalder', () => {
  afterEach(() => {
    loggerTeardown()
  })

  describe('Gitt at en bruker ikke mottar uføretrygd', () => {
    it('når tidligstMuligUttak ikke kunne hentes, vises riktig introduksjonstekst og readmore nederst har riktig tekst', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={undefined}
          ufoeregrad={0}
          hasAfpOffentlig={false}
          show1963Text={false}
        />
      )

      expect(screen.getByText('tidligstmuliguttak.error')).toBeInTheDocument()
      expect(
        screen.getByText('tidligstmuliguttak.readmore_title')
      ).toBeInTheDocument()
      expect(
        screen.queryByText(
          'Den oppgitte alderen er et estimat etter dagens regler.',
          { exact: false }
        )
      ).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'Stortinget har blitt enige om endringer i pensjonssystemet.',
          { exact: false }
        )
      ).toBeInTheDocument()
    })

    it('når tidligstMuligUttak kunne hentes, vises readmore nederst med riktig tekst ', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={{ aar: 65, maaneder: 3 }}
          ufoeregrad={0}
          hasAfpOffentlig={false}
          show1963Text={false}
        />
      )
      expect(
        screen.queryByText('tidligstmuliguttak.error')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('tidligstmuliguttak.readmore_title')
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Den oppgitte alderen er et estimat etter dagens regler.',
          { exact: false }
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Stortinget har blitt enige om endringer i pensjonssystemet.',
          { exact: false }
        )
      ).toBeInTheDocument()
    })

    it('når brukeren er født etter 1963, vises riktig ingress ', async () => {
      const user = userEvent.setup()
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
          ufoeregrad={0}
          hasAfpOffentlig={false}
          show1963Text={false}
        />
      )
      await waitFor(() => {
        expect(
          screen.queryByText('Din opptjening gjør at du tidligst kan ta ut', {
            exact: false,
          })
        ).not.toBeInTheDocument()
        expect(
          screen.getByText(
            'Din opptjening gjør at du etter dagens regler tidligst kan ta ut',
            { exact: false }
          )
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
      await user.click(screen.getByText('tidligstmuliguttak.readmore_title'))
      expect(
        screen.getByText(
          'Den oppgitte alderen er et estimat etter dagens regler.',
          { exact: false }
        )
      ).toBeInTheDocument()
    })

    it('når brukeren er født i 1963, vises riktig ingress ', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
          ufoeregrad={0}
          hasAfpOffentlig={false}
          show1963Text
        />
      )
      await waitFor(() => {
        expect(
          screen.queryByText('Din opptjening gjør at du tidligst kan ta ut', {
            exact: false,
          })
        ).toBeInTheDocument()
        expect(
          screen.queryByText(
            'Din opptjening gjør at du etter dagens regler tidligst kan ta ut',
            { exact: false }
          )
        ).not.toBeInTheDocument()
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
    })

    it('når brukeren mottar omstillingsstønad eller gjenlevendepensjon, vises riktig alertboks', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
          ufoeregrad={0}
          hasAfpOffentlig={false}
          show1963Text={false}
        />,
        {
          preloadedState: {
            api: {
              /* eslint-disable @typescript-eslint/ban-ts-comment */
              // @ts-ignore
              queries: {
                ...fullfilledGetOmstillingsstoenadOgGjenlevende,
              },
            },
            userInput: { ...userInputInitialState },
          },
        }
      )

      await waitFor(() => {
        expect(
          screen.getByText(
            'tidligstmuliguttak.info_omstillinngsstoenad_og_gjenlevende'
          )
        ).toBeInTheDocument()
      })
    })

    it('når brukeren ikke har valgt AFP-offentlig, vises ikke AFP melding', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
          ufoeregrad={0}
          hasAfpOffentlig={false}
          show1963Text={false}
        />
      )

      await waitFor(() => {
        expect(
          screen.getByText('62 alder.aar string.og 9 alder.maaneder', {
            exact: false,
          })
        ).toBeInTheDocument()

        expect(
          screen.queryByText('tidligstmuliguttak.info_afp')
        ).not.toBeInTheDocument()
      })
    })

    it('når brukeren har valgt AFP-offentlig, men at tidligstMuligUttak er 62, vises ikke AFP melding', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={{ aar: 62, maaneder: 0 }}
          ufoeregrad={0}
          hasAfpOffentlig={true}
          show1963Text={false}
        />
      )
      await waitFor(() => {
        expect(
          screen.queryByText('tidligstmuliguttak.info_afp')
        ).not.toBeInTheDocument()
      })
    })

    it('når brukeren har AFP offentlig og tidligstMuligUttak etter 62, vises AFP melding ', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
          ufoeregrad={0}
          hasAfpOffentlig={true}
          show1963Text={false}
        />
      )
      await waitFor(() => {
        expect(
          screen.getByText('tidligstmuliguttak.info_afp')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Gitt at en bruker ikke mottar uføretrygd', () => {
    it('når tidligstMuligUttak ikke kunne hentes, vises ikke noe feilmelding og readmore nederst har riktig tekst', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={undefined}
          ufoeregrad={100}
          hasAfpOffentlig={false}
          show1963Text={false}
        />
      )

      expect(
        screen.queryByText('tidligstmuliguttak.error')
      ).not.toBeInTheDocument()

      expect(
        screen.queryByText('tidligstmuliguttak.readmore_title')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('omufoeretrygd.readmore.title')
      ).toBeInTheDocument()
    })

    it('viser riktig innhold med 100 % ufoeretrygd', async () => {
      const user = userEvent.setup()
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={undefined}
          ufoeregrad={100}
          hasAfpOffentlig={false}
          show1963Text={false}
        />
      )

      expect(
        await screen.findByText(
          'alderspensjon fra 67 år. Kommende lovendringer vil gradvis øke pensjonsalderen for dem som er født i 1964 eller senere.',
          {
            exact: false,
          }
        )
      ).toBeVisible()

      await user.click(screen.getByText('omufoeretrygd.readmore.title'))
      expect(
        screen.getByText(
          'uføretrygd kan ikke kombineres med alderspensjon. Det er derfor ikke mulig å beregne alderspensjon før 67 år i kalkulatoren. Ved 67 år går',
          { exact: false }
        )
      ).toBeInTheDocument()
    })

    it('viser riktig innhold med gradert ufoeretrygd', async () => {
      const flushCurrentSimulationMock = vi.spyOn(
        userInputReducerUtils.userInputActions,
        'flushCurrentSimulation'
      )
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )

      const user = userEvent.setup()
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={undefined}
          ufoeregrad={75}
          hasAfpOffentlig={false}
          show1963Text={false}
        />
      )

      expect(
        await screen.findByText(
          'alderspensjon fra 67 år. Vil du beregne uttak før 67 år, må du gå til ',
          {
            exact: false,
          }
        )
      ).toBeVisible()

      await user.click(screen.getByText('omufoeretrygd.readmore.title'))
      expect(
        screen.getByText(
          'Det er mulig å kombinere gradert uføretrygd og gradert alderspensjon fra 62 år, så lenge du har høy nok opptjening til å ta ut alderspensjon.',
          { exact: false }
        )
      ).toBeInTheDocument()
      await user.click(screen.getByText('omufoeretrygd.avansert_link'))
      expect(flushCurrentSimulationMock).toHaveBeenCalled()
      expect(navigateMock).toHaveBeenCalledWith(paths.beregningAvansert)
    })

    it('når brukeren mottar omstillingsstønad eller gjenlevendepensjon, vises riktig alertboks', async () => {
      render(
        <TidligstMuligUttaksalder
          tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
          ufoeregrad={75}
          hasAfpOffentlig={false}
          show1963Text={false}
        />,
        {
          preloadedState: {
            api: {
              /* eslint-disable @typescript-eslint/ban-ts-comment */
              // @ts-ignore
              queries: {
                ...fullfilledGetOmstillingsstoenadOgGjenlevende,
              },
            },
            userInput: { ...userInputInitialState },
          },
        }
      )

      await waitFor(() => {
        expect(
          screen.getByText(
            'tidligstmuliguttak.info_omstillinngsstoenad_og_gjenlevende'
          )
        ).toBeInTheDocument()
      })
    })
  })
})
