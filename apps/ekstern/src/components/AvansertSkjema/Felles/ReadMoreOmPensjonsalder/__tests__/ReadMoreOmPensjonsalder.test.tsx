import { ReadMoreOmPensjonsalder } from '../ReadMoreOmPensjonsalder'
import { fulfilledGetPersonMedOekteAldersgrenser } from '@/mocks/mockedRTKQueryApiCalls'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, userEvent } from '@/test-utils'

describe('ReadMoreOmPensjonsalder', () => {
  describe('Gitt at en bruker ikke har uføretrygd, ', () => {
    it('viser riktig info om pensjonsalder', async () => {
      const user = userEvent.setup()
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
      await user.click(
        screen.getByText('beregning.read_more.pensjonsalder.label')
      )
      expect(
        screen.queryByText('omufoeretrygd.readmore.title')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('Aldersgrensene vil øke gradvis fra 1964-kullet', {
          exact: false,
        })
      ).toBeVisible()
    })

    it('Når brukeren har vedtak om alderspensjon, viser riktig info om pensjonsalder', async () => {
      const user = userEvent.setup()
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
      await user.click(
        screen.getByText('beregning.read_more.pensjonsalder.label')
      )
      expect(
        screen.queryByText('omufoeretrygd.readmore.title')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Aldersgrensene vil øke gradvis fra 1964-kullet', {
          exact: false,
        })
      ).not.toBeInTheDocument()

      expect(
        screen.getByText(
          'Opptjeningen din i folketrygden bestemmer hvor mye alderspensjon du kan ta ut. Ved 70 alder.aar må pensjonen minst tilsvare garantipensjon.',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })
  })

  describe('Gitt at en bruker har gradert uføretrygd, ', () => {
    it('viser riktig info om pensjonsalder', async () => {
      const user = userEvent.setup()
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
      await user.click(screen.getByText('omufoeretrygd.readmore.title'))
      expect(
        screen.queryByText('beregning.read_more.pensjonsalder.label')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'Din opptjening i folketrygden bestemmer når du kan ta ut alderspensjon.',
          { exact: false }
        )
      ).toBeVisible()
    })
  })

  describe('Gitt at en bruker har 100 % uføretrygd, ', () => {
    it('viser riktig info om pensjonsalder', async () => {
      const user = userEvent.setup()
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
      await user.click(screen.getByText('omufoeretrygd.readmore.title'))
      expect(
        screen.queryByText('beregning.read_more.pensjonsalder.label')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'Det er derfor ikke mulig å beregne alderspensjon før',
          { exact: false }
        )
      ).toBeVisible()
    })
  })
})
