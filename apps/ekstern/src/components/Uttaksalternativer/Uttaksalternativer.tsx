import React from 'react'

import {
  Alert,
  BodyLong,
  Button,
  Heading,
  Link,
  Loader,
} from '@navikt/ds-react'

import { useGetPensjonsberegningQuery } from '../../state/api/apiSlice'
import { isPensjonsberegning } from '../../state/api/typeguards'
import { formatAsDecimal } from '../../utils/currency'

import { UttaksalternativerChart } from './UttaksalternativerChart'

import styles from './Uttaksalternativer.module.scss'

const useInntekt = () => {
  return 678_000
}

export function Uttaksalternativer() {
  const { data, isLoading, isError } = useGetPensjonsberegningQuery()
  const inntekt = useInntekt()

  if (isLoading && !data) {
    return (
      <Loader
        className={styles.loader}
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
        <Heading spacing size="small" level="3">
          Vi klarte ikke å kalkulere pensjonen din. Prøv igjen senere.
        </Heading>
      </Alert>
    )
  }

  return (
    <section className={styles.uttaksalternativer}>
      <Heading size="small" level="3">
        Alternativer for når du kan ta ut
      </Heading>
      <BodyLong className={styles.uttaksalternativerParagraph}>
        Hvis du fortsetter å ha en inntekt på{' '}
        <strong>{formatAsDecimal(inntekt)} kr</strong> kan du tidligst gå av med
        alderspensjon når du blir <strong>{data[0].alder} år</strong>. Hvis du
        går av senere, får du høyere pensjon.
      </BodyLong>
      <section
        aria-label="Pensjonsberegning"
        className={styles.uttaksalternativerChart}
      >
        <UttaksalternativerChart lønn={inntekt} beregning={data} />
        <Button variant="secondary">Sjekk hele pensjonen din</Button>
      </section>
      <Link href="#">Om hvordan vi beregner din pensjon</Link>
    </section>
  )
}
