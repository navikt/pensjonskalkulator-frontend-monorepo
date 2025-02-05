import { describe, it } from 'vitest'

import { Forbehold } from '..'
import { fulfilledGetPersonMedOkteAldersgrenser } from '@/mocks/mockedRTKQueryApiCalls'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen } from '@/test-utils'

describe('Forbehold', () => {
  it('har riktig sidetittel', () => {
    render(<Forbehold />, {
      preloadedState: {
        api: {
          //@ts-ignore
          queries: {
            ...fulfilledGetPersonMedOkteAldersgrenser,
          },
        },
        userInput: {
          ...userInputInitialState,
        },
      },
    })
    expect(document.title).toBe('application.title.forbehold')
  })

  it('rendrer seksjonene riktig', () => {
    render(<Forbehold />, {
      preloadedState: {
        api: {
          //@ts-ignore
          queries: {
            ...fulfilledGetPersonMedOkteAldersgrenser,
          },
        },
        userInput: {
          ...userInputInitialState,
        },
      },
    })
    expect(screen.getByText('forbehold.title')).toBeVisible()
    expect(screen.getByText('forbehold.inntekt.title')).toBeVisible()
    expect(screen.getByText('forbehold.utenlandsopphold.title')).toBeVisible()
    expect(screen.getByText('forbehold.sivilstand.title')).toBeVisible()
    expect(screen.getByText('forbehold.afp.title')).toBeVisible()
    expect(screen.getByText('forbehold.uforetrygd.title')).toBeVisible()
    expect(screen.getByText('forbehold.uforetrygd_afp.title')).toBeVisible()
    expect(screen.getByText('forbehold.gjenlevende.title')).toBeVisible()
    expect(screen.getByText('forbehold.pensjonsavtaler.title')).toBeVisible()
  })
})
