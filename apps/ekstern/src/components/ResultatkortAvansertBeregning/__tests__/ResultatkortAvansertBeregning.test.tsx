import { describe, it, vi } from 'vitest'

import {
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtakFremtidigMedAlderspensjon,
} from '@/mocks/mockedRTKQueryApiCalls'
import { apiSlice } from '@/state/api/apiSlice'
import {
  Simulation,
  userInputInitialState,
} from '@/state/userInput/userInputSlice'
import { render, screen, userEvent } from '@/test-utils'
import * as loggerUtils from '@/utils/logging'

import { ResultatkortAvansertBeregning } from '../ResultatkortAvansertBeregning'

describe('ResultatkortAvansertBeregning', () => {
  const currentSimulation: Simulation = {
    beregningsvalg: null,
    formatertUttaksalderReadOnly: '67 år string.og 0 alder.maaned',
    uttaksalder: { aar: 67, maaneder: 0 },
    aarligInntektFoerUttakBeloep: null,
    gradertUttaksperiode: null,
  }

  it('vises det riktig resultatkort med faste tekster og inntekt', async () => {
    const loggerSpy = vi.spyOn(loggerUtils, 'logger')
    const user = userEvent.setup()
    const { store } = render(
      <ResultatkortAvansertBeregning onButtonClick={vi.fn()} />,
      {
        preloadedState: {
          api: {
            /* @ts-ignore */
            queries: {
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      }
    )
    store.dispatch(apiSlice.endpoints.getInntekt.initiate())
    expect(
      await screen.findByText('beregning.avansert.resultatkort.tittel')
    ).toBeVisible()
    expect(
      await screen.findByText('beregning.avansert.resultatkort.description')
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Vis mer' }))
    expect(
      await screen.findByText('beregning.avansert.resultatkort.frem_til_uttak')
    ).toBeVisible()
    expect(await screen.findByText('521 338')).toBeVisible()
    expect(
      await screen.findByText('beregning.avansert.resultatkort.alderspensjon', {
        exact: false,
      })
    ).toBeVisible()
    user.click(
      await screen.findByText('beregning.avansert.resultatkort.button')
    )
    expect(loggerSpy).toHaveBeenCalledWith('expansion card åpnet', {
      tekst: 'Resultatkort avansert beregning',
    })
  })

  it('med vedtak om alderpensjon, vises det riktig resultatkort med faste tekster og inntekt', async () => {
    const { store } = render(
      <ResultatkortAvansertBeregning onButtonClick={vi.fn()} />,
      {
        preloadedState: {
          api: {
            /* @ts-ignore */
            queries: {
              ...fulfilledGetLoependeVedtakFremtidigMedAlderspensjon,
            },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      }
    )
    store.dispatch(apiSlice.endpoints.getInntekt.initiate())

    expect(
      screen.queryByText('beregning.avansert.resultatkort.frem_til_uttak')
    ).not.toBeInTheDocument()
    expect(
      await screen.findByText(
        'beregning.avansert.resultatkort.frem_til_endring'
      )
    ).toBeVisible()
  })

  it('med uttaksalder, vises det et resultatkort med riktig dynamiske tekster', async () => {
    const user = userEvent.setup()
    const { store } = render(
      <ResultatkortAvansertBeregning onButtonClick={vi.fn()} />,
      {
        preloadedState: {
          api: {
            /* @ts-ignore */
            queries: {
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: false,
            currentSimulation: { ...currentSimulation },
          },
        },
      }
    )
    await store.dispatch(apiSlice.endpoints.getPerson.initiate())
    await store.dispatch(apiSlice.endpoints.getInntekt.initiate())
    await user.click(screen.getByRole('button', { name: 'Vis mer' }))
    expect(
      await screen.findByText('67 alder.aar', {
        exact: false,
      })
    ).toBeVisible()
    expect(
      await screen.findByText('(01.05.2030)', {
        exact: false,
      })
    ).toBeVisible()
  })

  it('med uttaksalder og inntekt vsa 100 % alderspensjon, vises det et resultatkort med riktig dynamiske tekster', async () => {
    const user = userEvent.setup()
    const { store } = render(
      <ResultatkortAvansertBeregning onButtonClick={vi.fn()} />,
      {
        preloadedState: {
          api: {
            /* @ts-ignore */
            queries: {
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: false,
            currentSimulation: {
              ...currentSimulation,
              aarligInntektVsaHelPensjon: {
                beloep: '200 000',
                sluttAlder: { aar: 70, maaneder: 3 },
              },
            },
          },
        },
      }
    )
    await store.dispatch(apiSlice.endpoints.getPerson.initiate())
    await store.dispatch(apiSlice.endpoints.getInntekt.initiate())
    await user.click(screen.getByRole('button', { name: 'Vis mer' }))
    expect(
      await screen.findByText('67 alder.aar', {
        exact: false,
      })
    ).toBeVisible()
    expect(
      await screen.findByText('(01.05.2030)', {
        exact: false,
      })
    ).toBeVisible()
    expect(
      await screen.findByText(
        'beregning.avansert.resultatkort.inntekt_1beregning.tom70 alder.aar string.og 3 alder.md',
        {
          exact: false,
        }
      )
    ).toBeVisible()
    expect(
      await screen.findByText('200 000', {
        exact: false,
      })
    ).toBeVisible()
  })

  it('med uttaksalder og gradert uttak, vises det et resultatkort med riktig dynamiske tekster', async () => {
    const user = userEvent.setup()
    const { store } = render(
      <ResultatkortAvansertBeregning onButtonClick={vi.fn()} />,
      {
        preloadedState: {
          api: {
            /* @ts-ignore */
            queries: {
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: false,
            currentSimulation: {
              ...currentSimulation,
              gradertUttaksperiode: {
                grad: 20,
                uttaksalder: { aar: 65, maaneder: 3 },
                aarligInntektVsaPensjonBeloep: '100 000',
              },
            },
          },
        },
      }
    )
    await store.dispatch(apiSlice.endpoints.getPerson.initiate())
    await store.dispatch(apiSlice.endpoints.getInntekt.initiate())
    await user.click(screen.getByRole('button', { name: 'Vis mer' }))
    expect(
      await screen.findByText('65 alder.aar string.og 3 alder.md', {
        exact: false,
      })
    ).toBeVisible()
    expect(
      await screen.findByText('(01.08.2028)', {
        exact: false,
      })
    ).toBeVisible()
    expect(
      await screen.findByText('100 000', {
        exact: false,
      })
    ).toBeVisible()
    expect(
      await screen.findByText('67 alder.aar', {
        exact: false,
      })
    ).toBeVisible()
    expect(
      await screen.findByText('(01.05.2030)', {
        exact: false,
      })
    ).toBeVisible()
  })
})
