import { describe, it } from 'vitest'

import { GrunnlagPensjonsavtalerTable } from '../GrunnlagPensjonsavtalerTable'
import { render, screen } from '@/test-utils'

describe('GrunnlagPensjonsavtaler', () => {
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
      <GrunnlagPensjonsavtalerTable pensjonsavtaler={avtaler} />
    )
    expect(await screen.findByTestId('pensjonsavtaler-table')).toBeVisible()
    expect(
      await screen.findByText('grunnlag.pensjonsavtaler.tabell.title.left')
    ).toBeVisible()
    expect(
      await screen.findByText('grunnlag.pensjonsavtaler.tabell.title.right')
    ).toBeVisible()

    expect(await screen.findByText('Privat tjenestepensjon')).toBeVisible()
    expect(
      await screen.findByText(
        'grunnlag.pensjonsavtaler.livsvarig 67 grunnlag.pensjonsavtaler.aar'
      )
    ).toBeVisible()
    expect(
      await screen.findByText(
        'grunnlag.pensjonsavtaler.livsvarig 67 grunnlag.pensjonsavtaler.aar grunnlag.pensjonsavtaler.og 6 grunnlag.pensjonsavtaler.md'
      )
    ).toBeVisible()
    expect(await screen.findAllByText('12 345 kr')).toHaveLength(2)
    const rows = container.querySelectorAll('tr')
    expect(rows?.length).toBe(6)
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
      <GrunnlagPensjonsavtalerTable pensjonsavtaler={[avtale]} />
    )
    expect(await screen.findByTestId('pensjonsavtaler-table')).toBeVisible()
    expect(
      await screen.findByText('grunnlag.pensjonsavtaler.tabell.title.left')
    ).toBeVisible()
    expect(
      await screen.findByText('grunnlag.pensjonsavtaler.tabell.title.right')
    ).toBeVisible()

    expect(await screen.findByText('Privat tjenestepensjon')).toBeVisible()
    expect(
      await screen.findByText(
        'grunnlag.pensjonsavtaler.fra_og_med 67 grunnlag.pensjonsavtaler.aar grunnlag.pensjonsavtaler.til_og_med 77 grunnlag.pensjonsavtaler.aar'
      )
    ).toBeVisible()
    expect(
      await screen.findByText(
        'grunnlag.pensjonsavtaler.fra_og_med 67 grunnlag.pensjonsavtaler.aar grunnlag.pensjonsavtaler.og 6 grunnlag.pensjonsavtaler.md grunnlag.pensjonsavtaler.til_og_med 77 grunnlag.pensjonsavtaler.aar grunnlag.pensjonsavtaler.og 1 grunnlag.pensjonsavtaler.md'
      )
    ).toBeVisible()
    expect(await screen.findAllByText('12 345 kr')).toHaveLength(2)
    const rows = container.querySelectorAll('tr')
    expect(rows?.length).toBe(5)
  })
})
