import { describe, it } from 'vitest'

import {
  fulfilledGetLoependeVedtakFremtidig,
  fulfilledGetLoependeVedtakFremtidigMedAlderspensjon,
  fulfilledGetLoependeVedtakLoependeAlderspensjon,
} from '@/mocks/mockedRTKQueryApiCalls'
import { render, screen } from '@/test-utils'

import { InfoOmFremtidigVedtak } from '..'

describe('InfoOmFremtidigVedtak', () => {
  it('Ved gjeldende vedtak uten fremtidig vedtak, returnerer null', async () => {
    const { asFragment } = await render(
      <InfoOmFremtidigVedtak
        loependeVedtak={
          fulfilledGetLoependeVedtakLoependeAlderspensjon[
            'getLoependeVedtak(undefined)'
          ].data
        }
      />
    )
    expect(asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`)
  })

  it('Ved både gjeldende og fremtidig vedtak, returnerer null', async () => {
    const { asFragment } = await render(
      <InfoOmFremtidigVedtak
        loependeVedtak={
          fulfilledGetLoependeVedtakFremtidigMedAlderspensjon[
            'getLoependeVedtak(undefined)'
          ].data
        }
      />
    )
    expect(asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`)
  })

  it('Ved fremtidig vedtak, returnerer riktig tekst', () => {
    render(
      <InfoOmFremtidigVedtak
        loependeVedtak={
          fulfilledGetLoependeVedtakFremtidig['getLoependeVedtak(undefined)']
            .data
        }
      />
    )
    expect(
      screen.getByText(
        'Du har vedtak om 100 % alderspensjon fra 01.01.2099. Du kan gjøre en ny beregning her frem til uttak.'
      )
    ).toBeVisible()
  })
})
