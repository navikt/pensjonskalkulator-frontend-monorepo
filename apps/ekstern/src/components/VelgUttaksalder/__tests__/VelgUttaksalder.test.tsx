import { describe, expect, it } from 'vitest'

import { VelgUttaksalder } from '../VelgUttaksalder'
import { render, screen, userEvent } from '@/test-utils'

describe('VelgUttaksalder', () => {
  const realInnerWidth = window.innerWidth

  const uttaksalder: Alder = {
    aar: 62,
    maaneder: 10,
  }
  describe('Gitt at brukeren er på desktop', () => {
    it('viser riktige aldere når uttaksalder ikke er angitt', async () => {
      render(<VelgUttaksalder tidligstMuligUttak={undefined} />)
      expect(await screen.findAllByRole('button')).toHaveLength(14)
    })

    it('viser alle aldere (ikke noe Vis flere aldere knapp)', async () => {
      render(<VelgUttaksalder tidligstMuligUttak={uttaksalder} />)
      expect(await screen.findAllByRole('button')).toHaveLength(14)
      expect(screen.queryByText('Vis flere aldere')).not.toBeInTheDocument()
    })
  })

  describe('Gitt at brukeren er på mobil', () => {
    beforeEach(() => {
      Object.defineProperty(global.window, 'innerWidth', {
        value: 400,
        writable: true,
      })
    })
    afterEach(() => {
      window.innerWidth = realInnerWidth
    })

    it('viser ikke Vis flere aldere knapp når alle mulige aldere allerede vises', async () => {
      render(
        <VelgUttaksalder
          tidligstMuligUttak={{
            aar: 67,
            maaneder: 1,
          }}
        />
      )
      expect(await screen.findAllByRole('button')).toHaveLength(9)
      expect(screen.queryByText('Vis flere aldere')).not.toBeInTheDocument()
    })

    it('viser riktig label, ikon og antall knapper når brukeren ønsker å se flere aldere', async () => {
      const user = userEvent.setup()
      const result = render(
        <VelgUttaksalder tidligstMuligUttak={uttaksalder} />
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
      const valgtUttaksalderHandler = (alder: string) => {
        valgtUttaksalder = alder
      }

      const getProps = () => ({
        tidligstMuligUttak: uttaksalder,
        valgtUttaksalder,
        valgtUttaksalderHandler,
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
})
