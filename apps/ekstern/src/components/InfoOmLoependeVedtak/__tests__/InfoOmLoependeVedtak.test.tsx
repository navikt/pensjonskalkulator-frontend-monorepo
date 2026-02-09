import { describe, it } from 'vitest'

import {
  loependeVedtak75UfoeregradMock,
  loependeVedtakLoependeAFPprivatMock,
  loependeVedtakLoependeAlderspensjonMedSisteUtbetalingMock,
  loependeVedtakLoependeAlderspensjonMock,
} from '@/mocks/mockedRTKQueryApiCalls'
import { render, screen } from '@/test-utils'

import { InfoOmLoependeVedtak } from '..'

describe('InfoOmLoependeVedtak', () => {
  it('Når vedtaket ikke er oppgitt, returnerer null', async () => {
    const { asFragment } = render(<InfoOmLoependeVedtak />)
    expect(asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`)
  })

  it('Når vedtaket ikke gjelder alderspensjon, returnerer null', async () => {
    const { asFragment } = render(
      <InfoOmLoependeVedtak loependeVedtak={loependeVedtak75UfoeregradMock} />
    )
    expect(asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`)
  })

  it('Når vedtaket gjelder alderspensjon med 0 % uttaksgrad, returnerer riktig tekst', () => {
    render(
      <InfoOmLoependeVedtak
        loependeVedtak={loependeVedtakLoependeAFPprivatMock}
      />
    )
    expect(screen.getByText('Du har i dag', { exact: false })).toBeVisible()
    expect(screen.getByText('0 %', { exact: false })).toBeVisible()
    expect(screen.getByText('alderspensjon', { exact: false })).toBeVisible()
    expect(
      screen.queryByText('var dette', { exact: false })
    ).not.toBeInTheDocument()
  })

  it('Når vedtaket gjelder alderspensjon uten sisteUtbetaling, returnerer riktig tekst', () => {
    render(
      <InfoOmLoependeVedtak
        loependeVedtak={loependeVedtakLoependeAlderspensjonMock}
      />
    )
    expect(screen.getByText('Du har i dag', { exact: false })).toBeVisible()
    expect(screen.getByText('100 %', { exact: false })).toBeVisible()
    expect(screen.getByText('alderspensjon', { exact: false })).toBeVisible()
    expect(
      screen.queryByText('var dette', { exact: false })
    ).not.toBeInTheDocument()
  })

  it('Når vedtaket gjelder alderspensjon med sisteUtbetaling, returnerer riktig tekst', () => {
    render(
      <InfoOmLoependeVedtak
        loependeVedtak={
          loependeVedtakLoependeAlderspensjonMedSisteUtbetalingMock
        }
      />
    )
    expect(screen.getByText('Du har i dag', { exact: false })).toBeVisible()
    expect(screen.getByText('100 %', { exact: false })).toBeVisible()
    expect(screen.getByText('alderspensjon', { exact: false })).toBeVisible()
    expect(
      screen.getByText('I oktober var dette', { exact: false })
    ).toBeVisible()
    expect(screen.getByText('før skatt', { exact: false })).toBeVisible()
  })
})
