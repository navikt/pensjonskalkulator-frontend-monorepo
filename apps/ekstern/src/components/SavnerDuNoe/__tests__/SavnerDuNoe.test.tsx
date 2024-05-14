import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { SavnerDuNoe } from '..'
import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent } from '@/test-utils'

describe('SavnerDuNoe', () => {
  it('Når showAvansert er true, rendrer med riktig tekst og knapper', () => {
    render(<SavnerDuNoe headingLevel="2" showAvansert />)
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
    render(<SavnerDuNoe headingLevel="2" />)
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

  it('nullstiller input fra brukeren og redirigerer til avansert baregning når brukeren klikker på knappen', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<SavnerDuNoe headingLevel="2" showAvansert />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          currentSimulation: {
            formatertUttaksalderReadOnly: '67 år string.og 1 alder.maaned',
            uttaksalder: { aar: 67, maaneder: 1 },
            aarligInntektFoerUttakBeloep: '0',
            gradertUttaksperiode: null,
          },
        },
      },
    })

    await user.click(screen.getByText('savnerdunoe.button'))
    expect(navigateMock).toHaveBeenCalledWith(paths.beregningAvansert)
    expect(store.getState().userInput.currentSimulation).toStrictEqual({
      aarligInntektFoerUttakBeloep: null,
      formatertUttaksalderReadOnly: null,
      gradertUttaksperiode: null,
      uttaksalder: null,
    })
  })
})
