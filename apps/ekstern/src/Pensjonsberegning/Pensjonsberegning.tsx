import React, { useState } from 'react'
import {
  Alert,
  BodyLong,
  Button,
  Heading,
  Link,
  Loader,
  ToggleGroup,
} from '@navikt/ds-react'

import { useGetPensjonsberegningQuery } from '../state/api/apiSlice'
import { isPensjonsberegning } from '../state/api/typeguards'
import { formatAsDecimal } from '../utils/currency'

import styles from './Pensjonsberegning.module.scss'
import { BarChartIcon, TableIcon } from '@navikt/aksel-icons'
import { PensjonsberegningChart } from './PensjonsberegningChart'

const useInntekt = () => {
  return 678_000
}

export function Pensjonsberegning() {
  const { data, isLoading, isError } = useGetPensjonsberegningQuery()
  const inntekt = useInntekt()
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')

  const toggleViewMode = () => {
    setViewMode((prevState) => (prevState === 'chart' ? 'table' : 'chart'))
  }

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
      <Heading size="large" level="1">
        Hei Ola!
      </Heading>
      <BodyLong>
        Hvis du fortsetter å ha en inntekt på{' '}
        <strong>{formatAsDecimal(inntekt)} kr</strong> kan du tidligst gå av med
        alderspensjon når du blir <strong>{data[0].alder} år</strong>. Hvis du
        går av senere, får du høyere pensjon.
      </BodyLong>
      <section aria-label="Pensjonsberegning" className={styles.chart}>
        <PensjonsberegningChart
          lønn={inntekt}
          beregning={data}
          asTable={viewMode === 'table'}
        />
      </section>
      <Button variant="secondary">Sjekk hele pensjonen din</Button>
      <Link href="#">Om hvordan vi beregner din pensjon</Link>
      <ToggleGroup
        className={styles.toggleGroup}
        onChange={toggleViewMode}
        size="small"
        defaultValue={viewMode}
      >
        <ToggleGroup.Item value="chart">
          <BarChartIcon title="Diagram" />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="table">
          <TableIcon title="Tabell" />
        </ToggleGroup.Item>
      </ToggleGroup>
    </section>
  )
}
