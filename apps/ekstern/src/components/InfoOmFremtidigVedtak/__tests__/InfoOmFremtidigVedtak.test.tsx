import { describe, it } from 'vitest'

import {
  loependeVedtakFremtidigMedAlderspensjonMock,
  loependeVedtakFremtidigMock,
  loependeVedtakLoependeAlderspensjonMock,
} from '@/mocks/mockedRTKQueryApiCalls'
import { render, screen } from '@/test-utils'

import { InfoOmFremtidigVedtak } from '..'

describe('InfoOmFremtidigVedtak', () => {
  it('Ved gjeldende vedtak uten fremtidig vedtak, returnerer null', async () => {
    const { asFragment } = render(
      <InfoOmFremtidigVedtak
        loependeVedtak={loependeVedtakLoependeAlderspensjonMock}
      />
    )
    expect(asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`)
  })

  it('Ved både gjeldende og fremtidig vedtak, returnerer null', async () => {
    const { asFragment } = render(
      <InfoOmFremtidigVedtak
        loependeVedtak={loependeVedtakFremtidigMedAlderspensjonMock}
      />
    )
    expect(asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`)
  })

  it('Ved fremtidig vedtak, returnerer riktig tekst', () => {
    render(
      <InfoOmFremtidigVedtak loependeVedtak={loependeVedtakFremtidigMock} />
    )
    expect(
      screen.getByText(
        'Du har vedtak om 100 % alderspensjon fra 01.01.2099. Frem til denne datoen kan du gjøre en ny beregning av andre alternativer.'
      )
    ).toBeVisible()
  })
})
