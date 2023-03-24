import React from 'react'

import { Alert, BodyLong, Heading, Loader } from '@navikt/ds-react'

import { useGetPensjonsberegningQuery } from '../state/api/apiSlice'
import { isPensjonsberegning } from '../state/api/typeguards'

import styles from './Pensjonsberegning.module.scss'

export function Pensjonsberegning() {
  const { data, isLoading, isError } = useGetPensjonsberegningQuery()

  if (isLoading && !data) {
    return (
      <Loader
        data-testid="loader"
        size="3xlarge"
        title="Henter pensjonsberegning"
      />
    )
  }

  // TODO: Her bør det være unødvendig å sjekke om data er pensjonsberegning siden det burde være fanget opp av isError.
  //  Hvordan kan man få RTK Query / Typescript til så skjønne det? Har ikke redux-teamet fått til type narrowing automatisk?
  if (isError || !isPensjonsberegning(data)) {
    return (
      <Alert variant="error">
        <Heading spacing size="small" level="1">
          Vi klarte ikke å kalkulere pensjonen din. Prøv igjen senere.
        </Heading>
      </Alert>
    )
  }

  return (
    <section className={styles.sammenligning}>
      <BodyLong>
        Hvis du fortsetter å ha samme inntekt som du har i dag kan du tidligst
        gå av med pensjon ved <b>{data[0].alder} år</b> hvor du vil få utbetalt{' '}
        <b>{data[0].pensjonsbeloep} kroner</b> i året
      </BodyLong>
      {data[1] && (
        <BodyLong>
          Dersom du jobber frem til du er <b>{data[1].alder} år</b>, vil du få{' '}
          <b>{data[1].pensjonsbeloep} kroner</b> utbetalt
        </BodyLong>
      )}
      {data[2] && (
        <BodyLong>
          Dersom du jobber frem til du er <b>{data[2].alder} år</b>, vil du få{' '}
          <b>{data[2].pensjonsbeloep} kroner</b> utbetalt
        </BodyLong>
      )}
    </section>
  )
}
