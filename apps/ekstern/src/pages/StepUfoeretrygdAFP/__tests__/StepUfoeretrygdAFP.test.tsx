import { describe, it, vi } from 'vitest'

import {
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtak75Ufoeregrad,
} from '@/mocks/mockedRTKQueryApiCalls'
import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, userEvent } from '@/test-utils'

import { StepUfoeretrygdAFP } from '..'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('StepUfoeretrygdAFP', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('har riktig sidetittel', () => {
    render(<StepUfoeretrygdAFP />)
    expect(document.title).toBe('application.title.stegvisning.ufoeretryg_AFP')
  })

  it('sender til neste steg når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()

    render(<StepUfoeretrygdAFP />, {
      preloadedState: {
        api: {
          // @ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
          },
        },
      },
    })
    await user.click(await screen.findByText('stegvisning.neste'))
    expect(navigateMock).toHaveBeenCalledWith(paths.samtykkeOffentligAFP)
  })

  it('navigerer tilbake når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()

    render(<StepUfoeretrygdAFP />, {
      preloadedState: {
        api: {
          // @ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtak75Ufoeregrad,
          },
        },
        userInput: { ...userInputInitialState, afp: 'ja_privat' },
      },
    })
    await user.click(await screen.findByText('stegvisning.tilbake'))
    expect(navigateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.stringContaining('back=true') as string,
      })
    )
  })

  describe('Gitt at brukeren er logget på som veileder', async () => {
    it('vises ikke Avbryt knapp', async () => {
      render(<StepUfoeretrygdAFP />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            veilederBorgerFnr: '81549300',
          },
        },
      })
      expect(await screen.findAllByRole('button')).toHaveLength(3)
    })
  })
})
