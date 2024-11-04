import React from 'react'

import { ReadMore as ReadMoreAksel } from '@navikt/ds-react'

import { formatInntekt } from '@/utils/inntekt'

export function Simuleringsdetaljer(props: {
  alderspensjonListe?: PensjonsberegningMedDetaljer[]
  detaljer: {
    trygdetid?: number
    opptjeningsgrunnlag?: SimulertOpptjeningGrunnlag[]
  }
}) {
  const { alderspensjonListe, detaljer } = props

  return (
    <ReadMoreAksel name="Tabell av beregningen" header="Detaljer (dev only)">
      <dl>
        <dt>
          <strong>Trygdetid:</strong>
        </dt>
        <dd>
          <ul>
            <li>
              {detaljer.trygdetid ? detaljer.trygdetid : 'Ingen data om '} år
            </li>
          </ul>
        </dd>
        <dt>
          <strong>Opptjeningsgrunnlag:</strong>
        </dt>
        <dd>
          {detaljer?.opptjeningsgrunnlag &&
          detaljer?.opptjeningsgrunnlag.length > 0 ? (
            <ul>
              {detaljer.opptjeningsgrunnlag.map((grunnlag, index) => (
                <li key={index}>
                  <strong>År: </strong>
                  {grunnlag.aar}
                  <br />
                  <strong>Pensjonsgivende Inntekt: </strong>
                  {formatInntekt(grunnlag.pensjonsgivendeInntektBeloep)}
                  {' NOK'}
                </li>
              ))}
            </ul>
          ) : (
            'Ingen opptjeningsgrunnlag'
          )}
        </dd>
        <dt>
          <strong>Alderspensjon:</strong>
        </dt>
        <dd>
          {alderspensjonListe && alderspensjonListe.length > 0 ? (
            <ul>
              {alderspensjonListe.map((alderspensjon, index) => (
                <li key={index}>
                  <strong>Alder: </strong>
                  {` ${alderspensjon.alder} år`}
                  <br />
                  <strong>Beløp: </strong>{' '}
                  {`${formatInntekt(alderspensjon.beloep)} NOK`}
                  <br />
                  <strong>Inntektspensjonsbeløp: </strong>
                  {`${
                    alderspensjon.inntektspensjonBeloep
                      ? formatInntekt(alderspensjon.inntektspensjonBeloep)
                      : '0'
                  } NOK`}
                  <br />
                  <strong>Garantipensjonsbeløp: </strong>
                  {`${
                    alderspensjon.garantipensjonBeloep
                      ? formatInntekt(alderspensjon.garantipensjonBeloep)
                      : '0'
                  } NOK`}
                  <br />
                  <strong>Delingstall: </strong> {alderspensjon.delingstall}
                  <br />
                  <strong>Pensjonsabeholdning før uttak: </strong>
                  {`${
                    alderspensjon.pensjonBeholdningFoerUttakBeloep
                      ? formatInntekt(
                          alderspensjon.pensjonBeholdningFoerUttakBeloep
                        )
                      : '0'
                  } NOK`}
                </li>
              ))}
            </ul>
          ) : (
            'Ingen alderspensjon'
          )}
        </dd>
      </dl>
    </ReadMoreAksel>
  )
}
