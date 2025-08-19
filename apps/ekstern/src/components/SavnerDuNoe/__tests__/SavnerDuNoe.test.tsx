import { describe, it, vi } from 'vitest'

import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, userEvent } from '@/test-utils'

import { SavnerDuNoe } from '..'

// * Mock navigate from react-router
const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('SavnerDuNoe', () => {
  beforeEach(() => {
    navigateMock.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Gitt at brukeren ikke har mulighet til å endre alderspensjon', () => {
    it('rendrer med riktig tittel og ingress', () => {
      render(<SavnerDuNoe isEndring={false} />)

      expect(screen.queryByText('savnerdunoe.title')).toBeVisible()
      expect(screen.queryByText('savnerdunoe.ingress')).toBeVisible()

      expect(
        screen.queryByText('savnerdunoe.title.endring')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('savnerdunoe.ingress.endring')
      ).not.toBeInTheDocument()
    })

    it('nullstiller input fra brukeren og redirigerer til avansert beregning når brukeren klikker på lenken', async () => {
      const user = userEvent.setup()

      const { store } = render(<SavnerDuNoe isEndring={false} />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              beregningsvalg: null,
              uttaksalder: { aar: 67, maaneder: 1 },
              aarligInntektFoerUttakBeloep: '0',
              gradertUttaksperiode: null,
            },
          },
        },
      })
      await user.click(screen.getByText('savnerdunoe.title'))
      expect(navigateMock).toHaveBeenCalledWith(paths.beregningAvansert)
      expect(store.getState().userInput.currentSimulation).toStrictEqual({
        aarligInntektFoerUttakBeloep: null,
        beregningsvalg: null,
        gradertUttaksperiode: null,
        uttaksalder: null,
      })
    })
  })

  describe('Gitt at brukeren har mulighet til å endre alderspensjon', () => {
    it('rendrer med riktig tittel og ingress', () => {
      render(<SavnerDuNoe isEndring={true} />)

      expect(screen.queryByText('savnerdunoe.title.endring')).toBeVisible()
      expect(screen.queryByText('savnerdunoe.ingress.endring')).toBeVisible()

      expect(screen.queryByText('savnerdunoe.title')).not.toBeInTheDocument()
      expect(screen.queryByText('savnerdunoe.ingress')).not.toBeInTheDocument()
    })

    it('navigerer til ekstern URL når brukeren klikker på lenken', async () => {
      const user = userEvent.setup()

      const openMock = vi.fn()
      vi.spyOn(window, 'open').mockImplementation(openMock)

      render(<SavnerDuNoe isEndring={true} />)

      await user.click(screen.getByText('savnerdunoe.title.endring'))

      expect(openMock).toHaveBeenCalledWith(
        expect.stringContaining('alderspensjon/endringssoknad'),
        '_blank',
        'noopener'
      )

      expect(navigateMock).not.toHaveBeenCalled()
    })
  })
})
