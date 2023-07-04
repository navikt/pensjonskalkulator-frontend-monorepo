import { waitFor } from '@testing-library/react'

import { Grunnlag } from '@/components/Grunnlag'
import { mockErrorResponse } from '@/mocks/server'
import { RootState } from '@/state/store'
import { render, screen } from '@/test-utils'

describe('Grunnlag', () => {
  const tidligstMuligUttak = { aar: 62, maaned: 10, uttaksdato: '2031-11-01' }
  const pensjonsavtale = {
    produktbetegnelse: 'Innskuddpensjon',
    kategori: 'INNSKUDD',
    startAlder: 67,
    startMaaned: 1,
    utbetalingsperiode: {
      startAlder: 67,
      startMaaned: 1,
      sluttAlder: 77,
      sluttMaaned: 1,
      aarligUtbetaling: 250000,
      grad: 100,
    },
  }

  it('viser loader for pensjonsavtaler', async () => {
    render(
      <Grunnlag
        tidligstMuligUttak={tidligstMuligUttak}
        pensjonsavtaler={[]}
        showLoader
        showError={false}
      />
    )
    expect(await screen.findByTestId('section-skeleton')).toBeVisible()
    expect(screen.queryByTestId('pensjonsavtaler')).not.toBeInTheDocument()
  })

  it('viser error for pensjonsavtaler', async () => {
    render(
      <Grunnlag
        tidligstMuligUttak={tidligstMuligUttak}
        pensjonsavtaler={[]}
        showLoader={false}
        showError
      />,
      {
        preloadedState: { userInput: { samtykke: true } } as RootState,
      }
    )

    expect(
      await screen.findByText(
        'Vi klarte ikke å hente pensjonsavtalene dine fra Norsk Pensjon. Prøv igjen senere.'
      )
    ).toBeVisible()
  })

  it('viser ikke pensjonsavtaler dersom antall avtaler er 0', async () => {
    render(
      <Grunnlag
        tidligstMuligUttak={tidligstMuligUttak}
        pensjonsavtaler={[]}
        showLoader={false}
        showError={false}
      />
    )
    expect(screen.queryByTestId('pensjonsavtaler')).not.toBeInTheDocument()
  })

  it('viser tidligst mulig uttak', async () => {
    render(
      <Grunnlag
        tidligstMuligUttak={tidligstMuligUttak}
        pensjonsavtaler={[]}
        showLoader={false}
        showError={false}
      />
    )
    expect(await screen.findByText('Tidligst mulig uttak:')).toBeVisible()
    expect(screen.getByText('62 år, 10 md.')).toBeVisible()
  })

  it('viser pensjonsavtaler', async () => {
    render(
      <Grunnlag
        tidligstMuligUttak={tidligstMuligUttak}
        pensjonsavtaler={[pensjonsavtale]}
        showLoader={false}
        showError={false}
      />
    )
    await waitFor(() => {
      expect(screen.queryByTestId('section-skeleton')).not.toBeInTheDocument()
    })
    expect(screen.getByTestId('pensjonsavtaler')).toBeInTheDocument()
  })
})
