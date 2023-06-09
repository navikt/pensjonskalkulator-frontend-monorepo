import { describe, expect, it, vi } from 'vitest'

import { VelgUttaksalder } from '../VelgUttaksalder'
import { fireEvent, render, screen, userEvent, waitFor } from '@/test-utils'

describe('VelgUttaksalder', () => {
  const uttaksalder: Uttaksalder = {
    aar: 62,
    maaned: 10,
    uttaksdato: '0000-00-00',
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
    let valgtUttaksalder = '63 år'
    const setValgtUttaksalder = (alder: string) => {
      valgtUttaksalder = alder
    }

    const getProps = () => ({
      tidligstMuligUttak: uttaksalder,
      valgtUttaksalder,
      setValgtUttaksalder,
    })

    const { rerender } = render(<VelgUttaksalder {...getProps()} />)

    await userEvent.click(screen.getByText('65 år', { exact: false }))
    rerender(<VelgUttaksalder {...getProps()} />)
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
      '65 år'
    )

    await userEvent.click(screen.getByText('Vis flere aldere'))
    rerender(<VelgUttaksalder {...getProps()} />)
    expect(screen.getByText('72 år', { exact: false })).toBeVisible()

    await userEvent.click(screen.getByText('72 år', { exact: false }))
    rerender(<VelgUttaksalder {...getProps()} />)
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
      '72 år'
    )
  })
})
