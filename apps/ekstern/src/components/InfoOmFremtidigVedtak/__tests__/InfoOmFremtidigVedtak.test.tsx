import { describe, it } from 'vitest'

import { InfoOmFremtidigVedtak } from '..'
import {
  fulfilledGetLoependeVedtakLoependeAlderspensjon,
  fulfilledGetLoependeVedtakFremtidig,
  fulfilledGetLoependeVedtakFremtidigMedAlderspensjon,
} from '@/mocks/mockedRTKQueryApiCalls'
import { render, screen } from '@/test-utils'

describe('InfoOmFremtidigVedtak', () => {
  it('Når vedtaket ikke er oppgitt, returnerer null', () => {
    const { asFragment } = render(<InfoOmFremtidigVedtak />)
    expect(asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`)
  })

  it('Når vedtaket ikke gjelder frem i tid, returnerer null', () => {
    const { asFragment } = render(
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

  it('Når brukeren har 100 % uføretrygd og vedtaket viser 0 % alderspensjon, returnerer null', () => {
    const { asFragment } = render(
      <InfoOmFremtidigVedtak
        loependeVedtak={{
          alderspensjon: {
            grad: 0,
            fom: '2020-10-02',
          },
          ufoeretrygd: {
            grad: 100,
          },
          harFremtidigLoependeVedtak: true,
        }}
      />
    )
    expect(asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`)
  })

  it('Når vedtaket gjelder frem i tid, returnerer riktig tekst', () => {
    render(
      <InfoOmFremtidigVedtak
        loependeVedtak={
          fulfilledGetLoependeVedtakFremtidig['getLoependeVedtak(undefined)']
            .data
        }
      />
    )
    expect(screen.getByText('stegvisning.fremtidigvedtak.alert')).toBeVisible()
  })

  it('Når vedtaket gjelder både nå og frem i tid, returnerer riktig tekst', () => {
    render(
      <InfoOmFremtidigVedtak
        loependeVedtak={
          fulfilledGetLoependeVedtakFremtidigMedAlderspensjon[
            'getLoependeVedtak(undefined)'
          ].data
        }
      />
    )
    expect(
      screen.getByText('stegvisning.fremtidigvedtak.endring.alert')
    ).toBeVisible()
  })

  it('Når vedtaket ikke er sentrert, returnerer riktig styling', () => {
    const { asFragment } = render(
      <InfoOmFremtidigVedtak
        loependeVedtak={
          fulfilledGetLoependeVedtakFremtidig['getLoependeVedtak(undefined)']
            .data
        }
      />
    )
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          aria-live="polite"
          class="_alert_2fc705 navds-alert navds-alert--info navds-alert--medium"
        >
          <svg
            aria-labelledby="title-r2"
            class="navds-alert__icon"
            fill="none"
            focusable="false"
            height="1em"
            role="img"
            viewBox="0 0 24 24"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title
              id="title-r2"
            >
              Informasjon
            </title>
            <path
              clip-rule="evenodd"
              d="M3.25 4A.75.75 0 0 1 4 3.25h16a.75.75 0 0 1 .75.75v16a.75.75 0 0 1-.75.75H4a.75.75 0 0 1-.75-.75zM11 7.75a1 1 0 1 1 2 0 1 1 0 0 1-2 0m-1.25 3a.75.75 0 0 1 .75-.75H12a.75.75 0 0 1 .75.75v4.75h.75a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1 0-1.5h.75v-4h-.75a.75.75 0 0 1-.75-.75"
              fill="currentColor"
              fill-rule="evenodd"
            />
          </svg>
          <div
            class="navds-alert__wrapper navds-alert__wrapper--maxwidth navds-body-long navds-body-long--medium"
          >
            stegvisning.fremtidigvedtak.alert
          </div>
        </div>
      </DocumentFragment>
    `)
  })

  it('Når vedtaket er sentrert, returnerer riktig styling', () => {
    const { asFragment } = render(
      <InfoOmFremtidigVedtak
        loependeVedtak={
          fulfilledGetLoependeVedtakFremtidig['getLoependeVedtak(undefined)']
            .data
        }
        isCentered
      />
    )
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          aria-live="polite"
          class="_alert_2fc705 _alert__centered_2fc705 navds-alert navds-alert--info navds-alert--medium"
        >
          <svg
            aria-labelledby="title-r3"
            class="navds-alert__icon"
            fill="none"
            focusable="false"
            height="1em"
            role="img"
            viewBox="0 0 24 24"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title
              id="title-r3"
            >
              Informasjon
            </title>
            <path
              clip-rule="evenodd"
              d="M3.25 4A.75.75 0 0 1 4 3.25h16a.75.75 0 0 1 .75.75v16a.75.75 0 0 1-.75.75H4a.75.75 0 0 1-.75-.75zM11 7.75a1 1 0 1 1 2 0 1 1 0 0 1-2 0m-1.25 3a.75.75 0 0 1 .75-.75H12a.75.75 0 0 1 .75.75v4.75h.75a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1 0-1.5h.75v-4h-.75a.75.75 0 0 1-.75-.75"
              fill="currentColor"
              fill-rule="evenodd"
            />
          </svg>
          <div
            class="navds-alert__wrapper navds-alert__wrapper--maxwidth navds-body-long navds-body-long--medium"
          >
            stegvisning.fremtidigvedtak.alert
          </div>
        </div>
      </DocumentFragment>
    `)
  })
})
