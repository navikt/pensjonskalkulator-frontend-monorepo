import { describe, expect, it, vi } from 'vitest'

import { VelgUttaksalder } from '../VelgUttaksalder'
import { fireEvent, render, screen, waitFor } from '@/test-utils'

describe('VelgUttaksalder', () => {
  const uttaksalder: Uttaksalder = {
    aar: 62,
    maaned: 10,
  }

  it('viser riktig label, ikon og antall knapper når brukeren ønsker å se flere aldere', async () => {
    const result = render(
      <VelgUttaksalder
        tidligstMuligUttak={uttaksalder}
        setValgtUttaksalder={vi.fn()}
      />
    )
    await waitFor(() => {
      expect(screen.getAllByRole('button')).toHaveLength(10)
      expect(result.asFragment()).toMatchSnapshot()
    })
    fireEvent.click(screen.getByText('Vis flere aldere'))

    await waitFor(() => {
      expect(screen.getAllByRole('button')).toHaveLength(15)
      expect(screen.getByText('Vis færre aldere')).toBeInTheDocument()
    })

    expect(result.asFragment()).toMatchSnapshot()
  })

  it('oppdaterer valgt knapp og kaller setValgtUttaksalder når brukeren velger en alder', async () => {
    const setValgtUttaksalderMock = vi.fn()
    render(
      <VelgUttaksalder
        tidligstMuligUttak={uttaksalder}
        valgtUttaksalder={'63 år'}
        setValgtUttaksalder={setValgtUttaksalderMock}
      />
    )

    fireEvent.click(screen.getByText('65 år'))
    expect(setValgtUttaksalderMock).toHaveBeenCalled()

    // await waitFor(async () => {
    //   fireEvent.click(screen.getByText('Vis flere aldere'))
    //   fireEvent.click(screen.getByText('72 år'))

    //   expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
    //     '72 år'
    //   )
    //   vi.useFakeTimers()
    //   vi.advanceTimersByTime(250)
    //   expect(setValgtUttaksalderMock).toHaveBeenCalled()

    //   vi.useRealTimers()
    // })
  })
})
