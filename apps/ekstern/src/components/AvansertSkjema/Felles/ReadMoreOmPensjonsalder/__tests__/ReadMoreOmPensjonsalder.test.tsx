import { ReadMoreOmPensjonsalder } from '../ReadMoreOmPensjonsalder'
import { fulfilledGetPersonMedOekteAldersgrenser } from '@/mocks/mockedRTKQueryApiCalls'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen } from '@/test-utils'

describe('ReadMoreOmPensjonsalder', () => {
  describe('Gitt at en bruker ikke har uføretrygd, ', () => {
    it('viser riktig info om pensjonsalder', () => {
      render(<ReadMoreOmPensjonsalder ufoeregrad={0} isEndring={false} />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPersonMedOekteAldersgrenser,
            },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      })
      expect(screen.getByTestId('om_TMU')).toBeInTheDocument()
    })

    it('Når brukeren har vedtak om alderspensjon, viser riktig info om pensjonsalder', () => {
      render(<ReadMoreOmPensjonsalder ufoeregrad={0} isEndring={true} />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPersonMedOekteAldersgrenser,
            },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      })
      expect(screen.getByTestId('om_TMU_endring')).toBeInTheDocument()
    })
  })

  describe('Gitt at en bruker har gradert uføretrygd, ', () => {
    it('viser riktig info om pensjonsalder', () => {
      render(<ReadMoreOmPensjonsalder ufoeregrad={75} isEndring={false} />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...fulfilledGetPersonMedOekteAldersgrenser },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      })
      expect(
        screen.getByTestId('om_pensjonsalder_UT_gradert_avansert')
      ).toBeInTheDocument()
    })
  })

  describe('Gitt at en bruker har 100 % uføretrygd, ', () => {
    it('viser riktig info om pensjonsalder', () => {
      render(<ReadMoreOmPensjonsalder ufoeregrad={100} isEndring={false} />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...fulfilledGetPersonMedOekteAldersgrenser },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      })
      expect(screen.getByTestId('om_pensjonsalder_UT_hel')).toBeInTheDocument()
    })
  })
})
