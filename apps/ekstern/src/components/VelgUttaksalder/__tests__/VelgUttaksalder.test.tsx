import { describe, expect, it, vi } from 'vitest'

import { VelgUttaksalder } from '../VelgUttaksalder'
import { render, screen, userEvent } from '@/test-utils'

describe('VelgUttaksalder', () => {
  const uttaksalder: Uttaksalder = {
    aar: 62,
    maaned: 10,
    uttaksdato: '2031-11-01',
  }

  it('viser ikke Vis flere aldere knapp når alle mulige aldere allerede vises', async () => {
    render(
      <VelgUttaksalder
        tidligstMuligUttak={{
          aar: 67,
          maaned: 1,
          uttaksdato: '2031-11-01',
        }}
        setValgtUttaksalder={vi.fn()}
      />
    )

    expect(await screen.findAllByRole('button')).toHaveLength(9)
    expect(screen.queryByText('Vis flere aldere')).not.toBeInTheDocument()
  })

  it('viser riktig label, ikon og antall knapper når brukeren ønsker å se flere aldere', async () => {
    const user = userEvent.setup()
    const result = render(
      <VelgUttaksalder
        tidligstMuligUttak={uttaksalder}
        setValgtUttaksalder={vi.fn()}
      />
    )

    expect(await screen.findAllByRole('button')).toHaveLength(10)
    expect(result.asFragment()).toMatchSnapshot()

    await user.click(screen.getByText('Vis flere aldere'))

    expect(await screen.findAllByRole('button')).toHaveLength(15)
    expect(await screen.findByText('Vis færre aldere')).toBeVisible()

    expect(result.asFragment()).toMatchSnapshot()
  })

  it('oppdaterer valgt knapp og kaller setValgtUttaksalder når brukeren velger en alder', async () => {
    const user = userEvent.setup()
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

    await user.click(screen.getByText('65 år', { exact: false }))
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled()

    rerender(<VelgUttaksalder {...getProps()} />)
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
      '65 år'
    )

    await user.click(screen.getByText('Vis flere aldere'))
    rerender(<VelgUttaksalder {...getProps()} />)
    expect(screen.getByText('72 år', { exact: false })).toBeVisible()

    await user.click(screen.getByText('72 år', { exact: false }))
    rerender(<VelgUttaksalder {...getProps()} />)
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
      '72 år'
    )
  })
})
