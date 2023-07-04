import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Pensjonsavtaler } from '../Pensjonsavtaler'
import { RootState } from '@/state/store'
import { render, screen, userEvent } from '@/test-utils'
describe('Pensjonsavtaler', () => {
  it('rendrer ingenting om avtalelisten er tom', () => {
    render(<Pensjonsavtaler pensjonsavtaler={[]} showError={false} />)
    expect(
      screen.queryByText('Pensjonsavtaler', { exact: false })
    ).not.toBeInTheDocument()
  })

  it('viser riktig header og melding når brukeren ikke samtykker', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Pensjonsavtaler pensjonsavtaler={[]} showError />, {
      preloadedState: { userInput: { samtykke: false } } as RootState,
    })
    expect(await screen.findByText('Ikke innhentet')).toBeVisible()
    expect(screen.queryByText('Kan ikke hentes')).not.toBeInTheDocument()
    expect(
      await screen.findByText(
        'Du har ikke samtykket til å hente inn pensjonsavtaler om tjenestepensjon.',
        { exact: false }
      )
    ).toBeVisible()
    await user.click(screen.getByText('Start en ny beregning'))
    expect(navigateMock).toHaveBeenCalledWith('/start')
  })

  describe('Gitt at brukeren har samtykket', () => {
    it('viser riktig header og melding dersom pensjonsavtaler har feilet', async () => {
      render(<Pensjonsavtaler pensjonsavtaler={[]} showError />, {
        preloadedState: { userInput: { samtykke: true } } as RootState,
      })
      expect(await screen.findByText('Kan ikke hentes')).toBeVisible()
      expect(
        await screen.findByText(
          'Vi klarte ikke å hente pensjonsavtalene dine fra Norsk Pensjon. Prøv igjen senere.'
        )
      ).toBeVisible()
    })

    it('rendrer riktig med avtaler som bare har start dato', () => {
      const { asFragment } = render(
        <Pensjonsavtaler
          pensjonsavtaler={[
            {
              produktbetegnelse: 'DNB',
              kategori: 'privat tjenestepensjon',
              startAlder: 67,
              startMaaned: 1,
              utbetalingsperiode: {
                startAlder: 67,
                startMaaned: 1,
                aarligUtbetaling: 12345,
                grad: 100,
              },
            },
          ]}
          showError={false}
        />,
        {
          preloadedState: { userInput: { samtykke: true } } as RootState,
        }
      )
      expect(
        screen.queryByText('Pensjonsavtaler', { exact: false })
      ).toBeVisible()
      expect(asFragment()).toMatchSnapshot()
    })

    it('rendrer riktig med avtaler som har både start- og sluttdato', () => {
      const { asFragment } = render(
        <Pensjonsavtaler
          pensjonsavtaler={[
            {
              produktbetegnelse: 'DNB',
              kategori: 'privat tjenestepensjon',
              startAlder: 67,
              startMaaned: 1,
              utbetalingsperiode: {
                startAlder: 67,
                startMaaned: 1,
                sluttAlder: 77,
                sluttMaaned: 8,
                aarligUtbetaling: 12345,
                grad: 100,
              },
            },
          ]}
          showError={false}
        />,
        {
          preloadedState: { userInput: { samtykke: true } } as RootState,
        }
      )
      expect(
        screen.queryByText('Pensjonsavtaler', { exact: false })
      ).toBeVisible()
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
