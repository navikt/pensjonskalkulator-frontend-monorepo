import { describe, expect, it } from 'vitest'

import { fulfilledGetPerson } from '@/mocks/mockedRTKQueryApiCalls'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, userEvent } from '@/test-utils'

import { VelgUttaksalder } from '../VelgUttaksalder'

describe('VelgUttaksalder', () => {
  const uttaksalder: Alder = {
    aar: 62,
    maaneder: 10,
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

  it('viser riktige aldere når uttaksalder ikke er angitt', async () => {
    render(<VelgUttaksalder tidligstMuligUttak={undefined} />, {
      // @ts-ignore
      preloadedState: {
        ...mockedState,
      },
    })
    expect(await screen.findAllByRole('button')).toHaveLength(14)
  })

  it('oppdaterer valgt knapp når brukeren velger en alder', async () => {
    const user = userEvent.setup()

    const getProps = () => ({
      tidligstMuligUttak: uttaksalder,
    })

    const { rerender } = render(<VelgUttaksalder {...getProps()} />, {
      // @ts-ignore
      preloadedState: {
        ...mockedState,
      },
    })

    await user.click(screen.getByText('65 alder.aar', { exact: false }))

    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled()

    rerender(<VelgUttaksalder {...getProps()} />)
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
      '65 alder.aar'
    )

    rerender(<VelgUttaksalder {...getProps()} />)
    expect(screen.getByText('72 alder.aar', { exact: false })).toBeVisible()

    await user.click(screen.getByText('72 alder.aar', { exact: false }))

    rerender(<VelgUttaksalder {...getProps()} />)
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
      '72 alder.aar'
    )
  })
})
