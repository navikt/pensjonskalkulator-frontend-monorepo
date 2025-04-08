import { describe, expect, it } from 'vitest'

import { render, screen } from '@/test-utils'

import { Simuleringsdetaljer } from '../Simuleringsdetaljer'

describe('Simuleringsdetaljer', () => {
  it('Når trygdetid er undefined, viser tomt år', () => {
    render(<Simuleringsdetaljer detaljer={{ trygdetid: undefined }} />)
    expect(screen.getByText('Trygdetid:')).toBeVisible()
    expect(screen.getByText('Ingen data om år')).toBeVisible()
  })

  it('viser trygdetid', () => {
    render(<Simuleringsdetaljer detaljer={{ trygdetid: 40 }} />)
    expect(screen.getByText('Trygdetid:')).toBeVisible()
    expect(screen.getByText('40 år')).toBeVisible()
  })

  it('Når opptjeningsgrunnlag er tomt, viser riktig tekst', () => {
    render(<Simuleringsdetaljer detaljer={{ opptjeningsgrunnlag: [] }} />)
    expect(screen.getByText('Ingen opptjeningsgrunnlag')).toBeVisible()
  })

  it('Når opptjeningsgrunnlag er undefined, viser riktig tekst', () => {
    render(
      <Simuleringsdetaljer detaljer={{ opptjeningsgrunnlag: undefined }} />
    )
    expect(screen.getByText('Opptjeningsgrunnlag:')).toBeVisible()
    expect(screen.getByText('Ingen opptjeningsgrunnlag')).toBeVisible()
  })

  it('viser opptjeningsgrunnlag', () => {
    const opptjeningsgrunnlag = [
      { aar: 2020, pensjonsgivendeInntektBeloep: 500000 },
      { aar: 2021, pensjonsgivendeInntektBeloep: 550000 },
    ]
    const { asFragment } = render(
      <Simuleringsdetaljer detaljer={{ opptjeningsgrunnlag }} />
    )
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="navds-read-more navds-read-more--medium"
          data-volume="low"
        >
          <button
            aria-expanded="false"
            class="navds-read-more__button navds-body-short"
            data-state="closed"
            name="Tabell av beregningen"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="navds-read-more__expand-icon"
              fill="none"
              focusable="false"
              height="1em"
              role="img"
              viewBox="0 0 24 24"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                d="M5.97 9.47a.75.75 0 0 1 1.06 0L12 14.44l4.97-4.97a.75.75 0 1 1 1.06 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-5.5-5.5a.75.75 0 0 1 0-1.06"
                fill="currentColor"
                fill-rule="evenodd"
              />
            </svg>
            <span>
              Detaljer (dev only)
            </span>
          </button>
          <div
            aria-hidden="true"
            class="navds-read-more__content navds-read-more__content--closed navds-body-long navds-body-long--medium"
            data-state="closed"
          >
            <dl>
              <dt>
                <strong>
                  Trygdetid:
                </strong>
              </dt>
              <dd>
                <ul>
                  <li>
                    Ingen data om  år
                  </li>
                </ul>
              </dd>
              <dt>
                <strong>
                  Opptjeningsgrunnlag:
                </strong>
              </dt>
              <dd>
                <ul>
                  <li>
                    <strong>
                      År: 
                    </strong>
                    2020
                    <br />
                    <strong>
                      Pensjonsgivende Inntekt: 
                    </strong>
                    500 000 NOK
                  </li>
                  <li>
                    <strong>
                      År: 
                    </strong>
                    2021
                    <br />
                    <strong>
                      Pensjonsgivende Inntekt: 
                    </strong>
                    550 000 NOK
                  </li>
                </ul>
              </dd>
              <dt>
                <strong>
                  Alderspensjon:
                </strong>
              </dt>
              <dd>
                Ingen alderspensjon
              </dd>
            </dl>
          </div>
        </div>
      </DocumentFragment>
    `)
  })

  it('Når det ikke er alderspensjon, viser riktig tekst', () => {
    render(<Simuleringsdetaljer alderspensjonListe={[]} detaljer={{}} />)
    expect(screen.getByText('Ingen alderspensjon')).toBeVisible()
  })

  it('viser alderspensjon', () => {
    const alderspensjonListe = [
      {
        alder: 67,
        beloep: 300000,
        inntektspensjonBeloep: 200000,
        garantipensjonBeloep: 100000,
        delingstall: 13.5,
        pensjonBeholdningFoerUttakBeloep: 400000,
        andelsbroekKap19: 0.7,
        andelsbroekKap20: 0.3,
        sluttpoengtall: 5.11,
        trygdetidKap19: 40,
        trygdetidKap20: 40,
        poengaarFoer92: 13,
        poengaarEtter91: 27,
        forholdstall: 0.971,
        grunnpensjon: 55180,
        tilleggspensjon: 134641,
        pensjonstillegg: -70243,
        skjermingstillegg: 0,
      },
    ]
    const { asFragment } = render(
      <Simuleringsdetaljer
        alderspensjonListe={alderspensjonListe}
        detaljer={{}}
      />
    )
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="navds-read-more navds-read-more--medium"
          data-volume="low"
        >
          <button
            aria-expanded="false"
            class="navds-read-more__button navds-body-short"
            data-state="closed"
            name="Tabell av beregningen"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="navds-read-more__expand-icon"
              fill="none"
              focusable="false"
              height="1em"
              role="img"
              viewBox="0 0 24 24"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                d="M5.97 9.47a.75.75 0 0 1 1.06 0L12 14.44l4.97-4.97a.75.75 0 1 1 1.06 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-5.5-5.5a.75.75 0 0 1 0-1.06"
                fill="currentColor"
                fill-rule="evenodd"
              />
            </svg>
            <span>
              Detaljer (dev only)
            </span>
          </button>
          <div
            aria-hidden="true"
            class="navds-read-more__content navds-read-more__content--closed navds-body-long navds-body-long--medium"
            data-state="closed"
          >
            <dl>
              <dt>
                <strong>
                  Trygdetid:
                </strong>
              </dt>
              <dd>
                <ul>
                  <li>
                    Ingen data om  år
                  </li>
                </ul>
              </dd>
              <dt>
                <strong>
                  Opptjeningsgrunnlag:
                </strong>
              </dt>
              <dd>
                Ingen opptjeningsgrunnlag
              </dd>
              <dt>
                <strong>
                  Alderspensjon:
                </strong>
              </dt>
              <dd>
                <ul>
                  <li>
                    <strong>
                      Alder: 
                    </strong>
                     67 år
                    <br />
                    <strong>
                      Beløp: 
                    </strong>
                     300 000 NOK
                    <br />
                    <strong>
                      Inntektspensjonsbeløp: 
                    </strong>
                    200 000 NOK
                    <br />
                    <strong>
                      Garantipensjonsbeløp: 
                    </strong>
                    100 000 NOK
                    <br />
                    <strong>
                      Delingstall: 
                    </strong>
                     13.5
                    <br />
                    <strong>
                      Pensjonsabeholdning før uttak: 
                    </strong>
                    400 000 NOK
                    <br />
                    <strong>
                      Andelsbrøk kap.19: 
                    </strong>
                     0.7
                    <br />
                    <strong>
                      Andelsbrøk kap.20: 
                    </strong>
                     0.3
                    <br />
                    <strong>
                      Sluttpoengtall: 
                    </strong>
                     5.11
                    <br />
                    <strong>
                      Trygdetid kap.19: 
                    </strong>
                     40
                    <br />
                    <strong>
                      Trygdetid kap.20: 
                    </strong>
                     40
                    <br />
                    <strong>
                      Poengår før 1992: 
                    </strong>
                     13
                    <br />
                    <strong>
                      Poengår etter 1991: 
                    </strong>
                     27
                    <br />
                    <strong>
                      Forholdstall: 
                    </strong>
                     0.971
                    <br />
                    <strong>
                      Grunnpensjon: 
                    </strong>
                    55 180 NOK
                    <br />
                    <strong>
                      Tillegspensjon: 
                    </strong>
                    134 641 NOK
                    <br />
                    <strong>
                      Pensjonstillegg: 
                    </strong>
                    −70 243 NOK
                    <br />
                    <strong>
                      Skjermingstillegg: 
                    </strong>
                    0 NOK
                    <br />
                  </li>
                </ul>
              </dd>
            </dl>
          </div>
        </div>
      </DocumentFragment>
    `)
  })

  it('Når inntektspensjonBeloep, garantipensjonBeloepviser, pensjonBeholdningFoerUttakBeloep, grunnpensjon, tilleggspensjon, pensjonstillegg og skjermingstillegg er undefined, viser alderspensjon.', () => {
    const alderspensjonListe = [
      {
        alder: 67,
        beloep: 300000,
        inntektspensjonBeloep: undefined,
        garantipensjonBeloep: undefined,
        delingstall: 13.5,
        pensjonBeholdningFoerUttakBeloep: undefined,
        andelsbroekKap19: 0.7,
        andelsbroekKap20: 0.3,
        sluttpoengtall: 5.11,
        trygdetidKap19: 40,
        trygdetidKap20: 40,
        poengaarFoer92: 13,
        poengaarEtter91: 27,
        forholdstall: 0.971,
        grunnpensjon: undefined,
        tilleggspensjon: undefined,
        pensjonstillegg: undefined,
        skjermingstillegg: undefined,
      },
    ]
    const { asFragment } = render(
      <Simuleringsdetaljer
        alderspensjonListe={alderspensjonListe}
        detaljer={{}}
      />
    )
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="navds-read-more navds-read-more--medium"
          data-volume="low"
        >
          <button
            aria-expanded="false"
            class="navds-read-more__button navds-body-short"
            data-state="closed"
            name="Tabell av beregningen"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="navds-read-more__expand-icon"
              fill="none"
              focusable="false"
              height="1em"
              role="img"
              viewBox="0 0 24 24"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                d="M5.97 9.47a.75.75 0 0 1 1.06 0L12 14.44l4.97-4.97a.75.75 0 1 1 1.06 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-5.5-5.5a.75.75 0 0 1 0-1.06"
                fill="currentColor"
                fill-rule="evenodd"
              />
            </svg>
            <span>
              Detaljer (dev only)
            </span>
          </button>
          <div
            aria-hidden="true"
            class="navds-read-more__content navds-read-more__content--closed navds-body-long navds-body-long--medium"
            data-state="closed"
          >
            <dl>
              <dt>
                <strong>
                  Trygdetid:
                </strong>
              </dt>
              <dd>
                <ul>
                  <li>
                    Ingen data om  år
                  </li>
                </ul>
              </dd>
              <dt>
                <strong>
                  Opptjeningsgrunnlag:
                </strong>
              </dt>
              <dd>
                Ingen opptjeningsgrunnlag
              </dd>
              <dt>
                <strong>
                  Alderspensjon:
                </strong>
              </dt>
              <dd>
                <ul>
                  <li>
                    <strong>
                      Alder: 
                    </strong>
                     67 år
                    <br />
                    <strong>
                      Beløp: 
                    </strong>
                     300 000 NOK
                    <br />
                    <strong>
                      Inntektspensjonsbeløp: 
                    </strong>
                    0 NOK
                    <br />
                    <strong>
                      Garantipensjonsbeløp: 
                    </strong>
                    0 NOK
                    <br />
                    <strong>
                      Delingstall: 
                    </strong>
                     13.5
                    <br />
                    <strong>
                      Pensjonsabeholdning før uttak: 
                    </strong>
                    0 NOK
                    <br />
                    <strong>
                      Andelsbrøk kap.19: 
                    </strong>
                     0.7
                    <br />
                    <strong>
                      Andelsbrøk kap.20: 
                    </strong>
                     0.3
                    <br />
                    <strong>
                      Sluttpoengtall: 
                    </strong>
                     5.11
                    <br />
                    <strong>
                      Trygdetid kap.19: 
                    </strong>
                     40
                    <br />
                    <strong>
                      Trygdetid kap.20: 
                    </strong>
                     40
                    <br />
                    <strong>
                      Poengår før 1992: 
                    </strong>
                     13
                    <br />
                    <strong>
                      Poengår etter 1991: 
                    </strong>
                     27
                    <br />
                    <strong>
                      Forholdstall: 
                    </strong>
                     0.971
                    <br />
                    <strong>
                      Grunnpensjon: 
                    </strong>
                    0 NOK
                    <br />
                    <strong>
                      Tillegspensjon: 
                    </strong>
                    0 NOK
                    <br />
                    <strong>
                      Pensjonstillegg: 
                    </strong>
                    0 NOK
                    <br />
                    <strong>
                      Skjermingstillegg: 
                    </strong>
                    0 NOK
                    <br />
                  </li>
                </ul>
              </dd>
            </dl>
          </div>
        </div>
      </DocumentFragment>
    `)
  })
})
