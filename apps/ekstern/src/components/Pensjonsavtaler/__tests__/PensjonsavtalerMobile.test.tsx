import { describe, it } from 'vitest'

import { PensjonsavtalerMobil } from '../PensjonsavtalerMobile'
import { render, screen } from '@/test-utils'

describe('PensjonsavtalerMobile', () => {
  it('rendrer riktig med avtaler som bare har start dato', async () => {
    const avtale: Pensjonsavtale = {
      key: 0,
      produktbetegnelse: 'DNB',
      kategori: 'PRIVAT_TJENESTEPENSJON',
      startAar: 67,
      utbetalingsperioder: [
        {
          startAlder: { aar: 67, maaneder: 0 },
          aarligUtbetaling: 12345,
          grad: 100,
        },
      ],
    }
    const avtaler = [
      avtale,
      {
        ...avtale,
        key: 1,
        utbetalingsperioder: [
          {
            ...avtale.utbetalingsperioder[0],
            startAlder: { aar: 67, maaneder: 6 },
          },
        ],
      },
    ]
    const { container } = render(
      <PensjonsavtalerMobil pensjonsavtaler={avtaler} />
    )
    expect(await screen.findByTestId('pensjonsavtaler-mobile')).toBeVisible()
    expect(await screen.findByText('Privat tjenestepensjon')).toBeVisible()
    expect(
      await screen.findByText('pensjonsavtaler.livsvarig 67 alder.aar:')
    ).toBeVisible()
    expect(
      await screen.findByText(
        'pensjonsavtaler.livsvarig 67 alder.aar string.og 6 alder.md:'
      )
    ).toBeVisible()
    expect(
      await screen.findAllByText('12 345 pensjonsavtaler.kr_pr_aar')
    ).toHaveLength(2)
    const rows = container.querySelectorAll('tr')
    expect(rows?.length).toBe(2)
  })

  it('rendrer riktig med avtaler som har både start- og sluttdato', async () => {
    const avtale: Pensjonsavtale = {
      key: 2,
      produktbetegnelse: 'DNB',
      kategori: 'PRIVAT_TJENESTEPENSJON',
      startAar: 67,
      sluttAar: 77,
      utbetalingsperioder: [
        {
          startAlder: { aar: 67, maaneder: 0 },
          sluttAlder: { aar: 77, maaneder: 11 },
          aarligUtbetaling: 12345,
          grad: 100,
        },
        {
          startAlder: { aar: 67, maaneder: 6 },
          sluttAlder: { aar: 77, maaneder: 1 },
          aarligUtbetaling: 12345,
          grad: 100,
        },
      ],
    }

    const { container } = render(
      <PensjonsavtalerMobil pensjonsavtaler={[avtale]} />
    )
    expect(await screen.findByTestId('pensjonsavtaler-mobile')).toBeVisible()

    expect(await screen.findByText('Privat tjenestepensjon')).toBeVisible()
    expect(
      await screen.findByText(
        'String.fra 67 alder.aar string.til 77 alder.aar:'
      )
    ).toBeVisible()
    expect(
      await screen.findByText(
        'String.fra 67 alder.aar string.og 6 alder.md string.til 77 alder.aar string.og 1 alder.md:'
      )
    ).toBeVisible()
    expect(
      await screen.findAllByText('12 345 pensjonsavtaler.kr_pr_aar')
    ).toHaveLength(2)
    const rows = container.querySelectorAll('tr')
    expect(rows?.length).toBe(2)
  })
})
