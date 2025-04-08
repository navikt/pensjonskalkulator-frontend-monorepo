import { describe, it, vi } from 'vitest'

import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, userEvent } from '@/test-utils'

import { SavnerDuNoe } from '..'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('SavnerDuNoe', () => {
  describe('Gitt at brukeren ikke har noe vedtak om alderspensjon', () => {
    it('Når showAvansert er true, rendrer med riktig tekst og knapper', () => {
      render(<SavnerDuNoe headingLevel="2" isEndring={false} showAvansert />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'savnerdunoe.title'
      )
      expect(screen.getByText('savnerdunoe.ingress')).toBeInTheDocument()
      expect(screen.getAllByRole('button')).toHaveLength(1)
      expect(
        screen.getByText('Denne kalkulatoren er under utvikling.', {
          exact: false,
        })
      ).toBeInTheDocument()
    })

    it('Når showAvansert er false, rendrer med riktig tekst og knapper', () => {
      render(<SavnerDuNoe headingLevel="2" isEndring={false} />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'savnerdunoe.title'
      )
      expect(screen.queryByText('savnerdunoe.ingress')).not.toBeInTheDocument()
      expect(screen.queryAllByRole('button')).toHaveLength(0)
      expect(
        screen.getByText('Denne kalkulatoren er under utvikling.', {
          exact: false,
        })
      ).toBeInTheDocument()
    })

    it('nullstiller input fra brukeren og redirigerer til avansert beregning når brukeren klikker på knappen', async () => {
      const user = userEvent.setup()

      const { store } = render(
        <SavnerDuNoe headingLevel="2" isEndring={false} showAvansert />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
              currentSimulation: {
                beregningsvalg: null,
                formatertUttaksalderReadOnly: '67 år string.og 1 alder.maaned',
                uttaksalder: { aar: 67, maaneder: 1 },
                aarligInntektFoerUttakBeloep: '0',
                gradertUttaksperiode: null,
              },
            },
          },
        }
      )

      await user.click(screen.getByText('savnerdunoe.button'))
      expect(navigateMock).toHaveBeenCalledWith(paths.beregningAvansert)
      expect(store.getState().userInput.currentSimulation).toStrictEqual({
        aarligInntektFoerUttakBeloep: null,
        beregningsvalg: null,
        formatertUttaksalderReadOnly: null,
        gradertUttaksperiode: null,
        uttaksalder: null,
      })
    })
  })

  describe('Gitt at brukeren ikke har noe vedtak om alderspensjon', () => {
    it('rendrer med riktig tekst og knapper (uavhengig av showAvansert)', () => {
      render(<SavnerDuNoe headingLevel="2" isEndring={true} />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'savnerdunoe.title.endring'
      )
      expect(screen.queryByText('savnerdunoe.ingress')).not.toBeInTheDocument()
      expect(screen.queryAllByRole('button')).toHaveLength(0)
      expect(
        screen.getByText('Send søknad om endring av alderspensjon i', {
          exact: false,
        })
      ).toBeInTheDocument()
    })
  })
})
