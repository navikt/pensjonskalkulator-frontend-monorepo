import { describe, it } from 'vitest'

import { fulfilledGetPerson } from '@/mocks/mockedRTKQueryApiCalls'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen } from '@/test-utils'

import { VilkaarsproevingAlert } from '..'

describe('VilkaarsproevingAlert', () => {
  describe('Uten gradert uføretrygd eller ikke valgt å beregne AFP', () => {
    const uttaksalder = { aar: 63, maaneder: 3 }
    const alternativ = {
      gradertUttaksalder: undefined,
      uttaksgrad: undefined,
      heltUttaksalder: { aar: 65, maaneder: 3 },
    }
    const mockedState = {
      api: {
        queries: {
          ...fulfilledGetPerson,
        },
      },
      userInput: {
        ...userInputInitialState,
      },
    }
    it('Når det foreslåtte alternativet er den default normert pensjonsalder, vises det riktig tekst', () => {
      render(
        <VilkaarsproevingAlert
          alternativ={{
            ...alternativ,
            heltUttaksalder: {
              aar: 67,
              maaneder: 0,
            },
          }}
          uttaksalder={uttaksalder}
        />,
        {
          // @ts-ignore
          preloadedState: {
            ...mockedState,
          },
        }
      )
      expect(
        screen.getByText('beregning.vilkaarsproeving.intro', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Du kan tidligst ta ut alderspensjon ved 67 alder.aar.',
          {
            exact: false,
          }
        )
      ).toBeInTheDocument()
    })

    it('Når det foreslåtte alternativet er uttaksalder for 100% uten gradering, vises det riktig tekst', () => {
      render(
        <VilkaarsproevingAlert
          alternativ={alternativ}
          uttaksalder={uttaksalder}
        />,
        {
          // @ts-ignore
          preloadedState: {
            ...mockedState,
          },
        }
      )

      expect(
        screen.getByText('beregning.vilkaarsproeving.intro', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Du må øke alderen eller sette ned uttaksgraden.', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Et alternativ er at du ved 65 år og 3 måneder kan ta ut',
          {
            exact: false,
          }
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText('100 %', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Prøv gjerne andre kombinasjoner.', {
          exact: false,
        })
      ).toBeInTheDocument()
    })

    it('Når det foreslåtte alternativet er lik uttaksalder med ny gradering, vises det riktig tekst', () => {
      render(
        <VilkaarsproevingAlert
          alternativ={{
            ...alternativ,
            heltUttaksalder: { ...uttaksalder },
            gradertUttaksalder: { aar: 65, maaneder: 3 },
            uttaksgrad: 40,
          }}
          uttaksalder={uttaksalder}
        />,
        {
          // @ts-ignore
          preloadedState: {
            ...mockedState,
          },
        }
      )

      expect(
        screen.getByText('beregning.vilkaarsproeving.intro', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Du må øke alderen eller sette ned uttaksgraden.', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Et alternativ er at du ved 65 år og 3 måneder kan ta ut',
          {
            exact: false,
          }
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText('40 %', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Prøv gjerne andre kombinasjoner.', {
          exact: false,
        })
      ).toBeInTheDocument()
    })

    it('Når det foreslåtte alternativet er ulik uttaksalder med ny gradering, vises det riktig tekst', () => {
      render(
        <VilkaarsproevingAlert
          alternativ={{
            ...alternativ,
            gradertUttaksalder: { aar: 68, maaneder: 5 },
            uttaksgrad: 40,
          }}
          uttaksalder={uttaksalder}
        />,
        {
          // @ts-ignore
          preloadedState: {
            ...mockedState,
          },
        }
      )

      expect(
        screen.getByText('beregning.vilkaarsproeving.intro', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Du må øke alderen eller sette ned uttaksgraden.', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Et alternativ er at du ved 68 år og 5 måneder kan ta ut',
          {
            exact: false,
          }
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText('40 %', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('100 %', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('ved 65 år og 3 måneder eller senere', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Prøv gjerne andre kombinasjoner.', {
          exact: false,
        })
      ).toBeInTheDocument()
    })
  })

  describe('Når brukeren har gradert uføretrygd og har valgt å beregne med AFP', () => {
    const uttaksalder = { aar: 63, maaneder: 3 }
    const alternativ = {
      gradertUttaksalder: undefined,
      uttaksgrad: undefined,
      heltUttaksalder: { aar: 65, maaneder: 3 },
    }
    const mockedState = {
      api: {
        queries: {
          ...fulfilledGetPerson,
        },
      },
      userInput: {
        ...userInputInitialState,
      },
    }

    it('Når det ikke er nok opptjening, vises det riktig tekst', () => {
      render(
        <VilkaarsproevingAlert
          alternativ={undefined}
          uttaksalder={uttaksalder}
          withAFP
        />,
        {
          // @ts-ignore
          preloadedState: {
            ...mockedState,
          },
        }
      )

      expect(
        screen.getByText(
          'Opptjeningen din er ikke høy nok til uttak av alderspensjon ved 62 alder.aar.',
          {
            exact: false,
          }
        )
      ).toBeInTheDocument()
    })

    it('Når det er gradert uttak med samme helt uttaksalder, vises det riktig tekst', () => {
      render(
        <VilkaarsproevingAlert
          alternativ={{
            ...alternativ,
            heltUttaksalder: { ...uttaksalder },
            gradertUttaksalder: { aar: 65, maaneder: 3 },
            uttaksgrad: 40,
          }}
          uttaksalder={uttaksalder}
          withAFP
        />,
        {
          // @ts-ignore
          preloadedState: {
            ...mockedState,
          },
        }
      )

      expect(
        screen.getByText('beregning.vilkaarsproeving.medAFP.intro', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Et alternativ er at du ved 62 alder.aar kan ta ut ', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('alderspensjon. Prøv gjerne andre kombinasjoner.', {
          exact: false,
        })
      ).toBeInTheDocument()
    })

    it('Når det er gradert uttak med ulik helt uttaksalder, vises det riktig tekst', () => {
      render(
        <VilkaarsproevingAlert
          alternativ={{
            ...alternativ,
            gradertUttaksalder: { aar: 68, maaneder: 5 },
            uttaksgrad: 40,
          }}
          uttaksalder={uttaksalder}
          withAFP
        />,
        {
          // @ts-ignore
          preloadedState: {
            ...mockedState,
          },
        }
      )

      expect(
        screen.getByText('beregning.vilkaarsproeving.medAFP.intro', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Et alternativ er at du ved 62 alder.aar kan ta ut ', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'alderspensjon ved 65 år og 3 måneder eller senere. Prøv gjerne andre kombinasjoner.',
          {
            exact: false,
          }
        )
      ).toBeInTheDocument()
    })
  })
})
