import { describe, it, vi } from 'vitest'

import { fulfilledGetLoependeVedtak0Ufoeregrad } from '@/mocks/mockedRTKQueryApiCalls'
import { mockResponse } from '@/mocks/server'
import { paths } from '@/router/constants'
import { apiSlice } from '@/state/api/apiSlice'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, userEvent } from '@/test-utils'

import { StepUtenlandsopphold } from '..'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('StepUtenlandsopphold', () => {
  it('har riktig sidetittel', () => {
    render(<StepUtenlandsopphold />)
    expect(document.title).toBe(
      'application.title.stegvisning.utenlandsopphold'
    )
  })

  it('Når brukeren svarer ja på utenlandsopphold, registreres det svaret og brukeren kan gå til neste steg når hen klikker på Neste', async () => {
    const user = userEvent.setup()

    const { store } = render(<StepUtenlandsopphold />, {
      preloadedState: {
        api: {
          // @ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
          },
        },
      },
    })
    expect(
      screen.getByText('stegvisning.utenlandsopphold.ingress')
    ).toBeVisible()
    const radioButtons = await screen.findAllByRole('radio')
    await user.click(radioButtons[1])
    await user.click(await screen.findByText('stegvisning.neste'))
    expect(navigateMock).toHaveBeenCalledWith(paths.afp)
    expect(store.getState().userInput.harUtenlandsopphold).toBe(false)
  })

  it('Når brukeren svarer nei på utenlandsopphold, registreres det svaret, slettes utenlandsoppholdene og brukeren er sendt videre til riktig side når hen klikker på Neste', async () => {
    const user = userEvent.setup()

    const { store } = render(<StepUtenlandsopphold />, {
      preloadedState: {
        api: {
          // @ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
          },
        },
        userInput: {
          ...userInputInitialState,
          utenlandsperioder: [
            {
              id: '1',
              landkode: 'SWE',
              startdato: '12.12.2012',
              sluttdato: '12.12.2013',
              arbeidetUtenlands: true,
            },
            {
              id: '2',
              landkode: 'SWE',
              startdato: '12.12.2020',
              arbeidetUtenlands: true,
            },
          ],
        },
      },
    })
    const radioButtons = await screen.findAllByRole('radio')

    await user.click(radioButtons[1])
    await user.click(await screen.findByText('stegvisning.neste'))

    expect(store.getState().userInput.harUtenlandsopphold).toBe(false)
    expect(store.getState().userInput.utenlandsperioder).toStrictEqual([])
    expect(navigateMock).toHaveBeenCalledWith(paths.afp)
  })

  it('nullstiller input fra brukeren og navigerer tilbake til /sivilstand når brukeren klikker på Tilbake', async () => {
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

    const user = userEvent.setup()

    const { store } = render(<StepUtenlandsopphold />, {
      preloadedState: {
        userInput: { ...userInputInitialState, harUtenlandsopphold: null },
      },
    })
    store.dispatch(apiSlice.endpoints.getPerson.initiate())
    const radioButtons = await screen.findAllByRole('radio')
    await user.click(radioButtons[0])
    expect(radioButtons[0]).toBeChecked()
    await user.click(await screen.findByText('stegvisning.tilbake'))
    expect(store.getState().userInput.harUtenlandsopphold).toBeNull()
    expect(navigateMock).toHaveBeenCalledWith(paths.sivilstand)
  })
})
