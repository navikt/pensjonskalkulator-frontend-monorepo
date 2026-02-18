import { personMedOekteAldersgrenseMock } from '@/mocks'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen } from '@/test-utils'

import { ReadMoreOmPensjonsalder } from '../ReadMoreOmPensjonsalder'

describe('ReadMoreOmPensjonsalder', () => {
  describe('Gitt at en bruker ikke har uføretrygd, ', () => {
    it('viser riktig info om pensjonsalder', () => {
      render(<ReadMoreOmPensjonsalder ufoeregrad={0} isEndring={false} />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
          },
        },
        preloadedApiState: { getPerson: personMedOekteAldersgrenseMock },
      })
      expect(screen.getByTestId('om_TMU')).toBeInTheDocument()
    })

    it('Når brukeren har vedtak om alderspensjon, viser riktig info om pensjonsalder', () => {
      render(<ReadMoreOmPensjonsalder ufoeregrad={0} isEndring={true} />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
          },
        },
        preloadedApiState: { getPerson: personMedOekteAldersgrenseMock },
      })
      expect(screen.getByTestId('om_TMU_endring')).toBeInTheDocument()
    })
  })

  describe('Gitt at en bruker har gradert uføretrygd, ', () => {
    it('viser riktig info om pensjonsalder', () => {
      render(<ReadMoreOmPensjonsalder ufoeregrad={75} isEndring={false} />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
          },
        },
        preloadedApiState: { getPerson: personMedOekteAldersgrenseMock },
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
          userInput: {
            ...userInputInitialState,
          },
        },
        preloadedApiState: { getPerson: personMedOekteAldersgrenseMock },
      })
      expect(screen.getByTestId('om_pensjonsalder_UT_hel')).toBeInTheDocument()
    })
  })
})
