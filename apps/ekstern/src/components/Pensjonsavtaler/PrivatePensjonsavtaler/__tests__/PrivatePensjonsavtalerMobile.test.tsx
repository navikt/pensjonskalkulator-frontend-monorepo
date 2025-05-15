import { describe, it } from 'vitest'

import { render, screen } from '@/test-utils'

import { PrivatePensjonsavtalerMobile } from '../PrivatePensjonsavtalerMobile'

describe('PrivatePensjonsavtalerMobile', () => {
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

  it('rendrer riktig header for pensjonsavtaler', async () => {
    render(
      <PrivatePensjonsavtalerMobile
        headingLevel="4"
        pensjonsavtaler={avtaler}
      />
    )
    expect(await screen.findAllByRole('heading', { level: 5 })).toHaveLength(2)
    expect(await screen.findAllByRole('heading', { level: 4 })).toHaveLength(1)
  })

  it('rendrer riktig med avtaler som bare har start dato', async () => {
    const { container } = await render(
      <PrivatePensjonsavtalerMobile
        headingLevel="4"
        pensjonsavtaler={avtaler}
      />
    )
    expect(
      await screen.findByTestId('private-pensjonsavtaler-mobile')
    ).toBeVisible()
    expect(await screen.findByText('Privat tjenestepensjon')).toBeVisible()
    expect(
      await screen.findByText('alder.livsvarig 67 alder.aar:')
    ).toBeVisible()
    expect(
      await screen.findByText(
        'alder.livsvarig 67 alder.aar string.og 6 alder.md:'
      )
    ).toBeVisible()
    expect(
      await screen.findAllByText('12 345 pensjonsavtaler.kr_pr_aar')
    ).toHaveLength(2)
    const rows = container.querySelectorAll('tr')
    expect(rows?.length).toBe(2)
  })

  it('rendrer riktig med avtaler som har både start- og sluttdato', async () => {
    const avtaleMedStartOgSlutt: Pensjonsavtale = {
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

    const { container } = await render(
      <PrivatePensjonsavtalerMobile
        headingLevel="4"
        pensjonsavtaler={[avtaleMedStartOgSlutt]}
      />
    )
    expect(
      await screen.findByTestId('private-pensjonsavtaler-mobile')
    ).toBeVisible()

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
