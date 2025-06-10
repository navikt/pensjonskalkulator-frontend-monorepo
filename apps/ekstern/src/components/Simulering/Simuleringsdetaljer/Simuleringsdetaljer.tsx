import { ReadMore as ReadMoreAksel } from '@navikt/ds-react'

import { formatInntekt } from '@/utils/inntekt'

export function Simuleringsdetaljer(props: {
  alderspensjonListe?: AlderspensjonPensjonsberegning[]
  detaljer: {
    trygdetid?: number
    opptjeningsgrunnlag?: SimulertOpptjeningGrunnlag[]
  }
  pre2025OffentligAfp?: AfpEtterfulgtAvAlderspensjon
}) {
  const { alderspensjonListe, detaljer, pre2025OffentligAfp } = props

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
                  <br />
                  <strong>Andelsbrøk kap.19: </strong>{' '}
                  {alderspensjon.andelsbroekKap19}
                  <br />
                  <strong>Andelsbrøk kap.20: </strong>{' '}
                  {alderspensjon.andelsbroekKap20}
                  <br />
                  <strong>Sluttpoengtall: </strong>{' '}
                  {alderspensjon.sluttpoengtall}
                  <br />
                  <strong>Trygdetid kap.19: </strong>{' '}
                  {alderspensjon.trygdetidKap19}
                  <br />
                  <strong>Trygdetid kap.20: </strong>{' '}
                  {alderspensjon.trygdetidKap20}
                  <br />
                  <strong>Poengår før 1992: </strong>{' '}
                  {alderspensjon.poengaarFoer92}
                  <br />
                  <strong>Poengår etter 1991: </strong>{' '}
                  {alderspensjon.poengaarEtter91}
                  <br />
                  <strong>Forholdstall: </strong> {alderspensjon.forholdstall}
                  <br />
                  <strong>Grunnpensjon: </strong>
                  {`${
                    alderspensjon.grunnpensjon
                      ? formatInntekt(alderspensjon.grunnpensjon)
                      : '0'
                  } NOK`}
                  <br />
                  <strong>Tillegspensjon: </strong>
                  {`${
                    alderspensjon.tilleggspensjon
                      ? formatInntekt(alderspensjon.tilleggspensjon)
                      : '0'
                  } NOK`}
                  <br />
                  <strong>Pensjonstillegg: </strong>
                  {`${
                    alderspensjon.pensjonstillegg
                      ? formatInntekt(alderspensjon.pensjonstillegg)
                      : '0'
                  } NOK`}
                  <br />
                  <strong>Skjermingstillegg: </strong>
                  {`${
                    alderspensjon.skjermingstillegg
                      ? formatInntekt(alderspensjon.skjermingstillegg)
                      : '0'
                  } NOK`}
                  <br />
                </li>
              ))}
            </ul>
          ) : (
            'Ingen alderspensjon'
          )}
        </dd>
        {pre2025OffentligAfp ? (
          <>
            <dt>
              <strong>AFP etterfulgt av alderspensjon:</strong>
            </dt>
            <dd>
              <ul>
                <li>
                  <strong>Alder: </strong> {pre2025OffentligAfp.alderAar}
                </li>
                <br />
                <li>
                  <strong>Totalt AFP beløp: </strong>{' '}
                  {`${
                    pre2025OffentligAfp.totaltAfpBeloep
                      ? formatInntekt(pre2025OffentligAfp.totaltAfpBeloep)
                      : '0'
                  } NOK`}
                </li>
                <br />
                <li>
                  <strong>Tidligere arbeidsinntekt: </strong>{' '}
                  {`${
                    pre2025OffentligAfp.tidligereArbeidsinntekt
                      ? formatInntekt(
                          pre2025OffentligAfp.tidligereArbeidsinntekt
                        )
                      : '0'
                  } NOK`}
                </li>
                <br />
                <li>
                  <strong>Grunnebeløp: </strong>{' '}
                  {`${
                    pre2025OffentligAfp.grunnbeloep
                      ? formatInntekt(pre2025OffentligAfp.grunnbeloep)
                      : '0'
                  } NOK`}
                </li>
                <br />
                <li>
                  <strong>Sluttpoengtall: </strong>{' '}
                  {pre2025OffentligAfp.sluttpoengtall}
                </li>
                <br />
                <li>
                  <strong>Trygdetid: </strong> {pre2025OffentligAfp.trygdetid}
                </li>
                <br />
                <li>
                  <strong>Poengår til og med 1991: </strong>{' '}
                  {pre2025OffentligAfp.poengaarTom1991}
                </li>
                <br />
                <li>
                  <strong>Poengår fra og med 1992: </strong>{' '}
                  {pre2025OffentligAfp.poengaarFom1992}
                </li>
                <br />
                <li>
                  <strong>Grunnpensjon: </strong>
                  {`${
                    pre2025OffentligAfp.grunnpensjon
                      ? formatInntekt(pre2025OffentligAfp.grunnpensjon)
                      : '0'
                  } NOK`}
                </li>
                <br />
                <li>
                  <strong>Tillegspensjon: </strong>
                  {`${
                    pre2025OffentligAfp.tilleggspensjon
                      ? formatInntekt(pre2025OffentligAfp.tilleggspensjon)
                      : '0'
                  } NOK`}
                </li>
                <br />
                <li>
                  <strong>AFP tillegg: </strong>
                  {`${
                    pre2025OffentligAfp.afpTillegg
                      ? formatInntekt(pre2025OffentligAfp.afpTillegg)
                      : '0'
                  } NOK`}
                </li>
                <br />
                <li>
                  <strong>Særtillegg: </strong>
                  {`${
                    pre2025OffentligAfp.saertillegg
                      ? formatInntekt(pre2025OffentligAfp.saertillegg)
                      : '0'
                  } NOK`}
                </li>
                <br />
                <li>
                  <strong>Afp grad: </strong>{' '}
                  {`${pre2025OffentligAfp.afpGrad} %`}
                </li>
                <br />
                <li>
                  <strong>70 prosent regelen: </strong>{' '}
                  {`${pre2025OffentligAfp.afpAvkortetTil70Prosent}`}
                </li>
              </ul>
            </dd>
          </>
        ) : (
          'Ingen gammel AFP data'
        )}
      </dl>
    </ReadMoreAksel>
  )
}
