import { useEffect, useState } from 'react'

import { Alert, BodyLong, Loader } from '@navikt/ds-react'

import { fetchPensjonsberegning } from '../api/pensjonsberegning'

import styles from './Pensjonsberegning.module.scss'

const usePensjonsberegning = (): FetchedData<Pensjonsberegning[]> => {
  const [beregning, setBeregning] = useState<FetchedData<Pensjonsberegning[]>>({
    data: null,
    isLoading: true,
    hasError: false,
  })

  useEffect(() => {
    fetchPensjonsberegning()
      .then((data: Pensjonsberegning[]) => {
        setBeregning({
          data: data.sort((a, b) => a.pensjonsaar - b.pensjonsaar),
          isLoading: false,
          hasError: false,
        })
      })
      .catch((error) => {
        // TODO add error loggingto a server?
        console.warn(error)
        setBeregning({
          data: null,
          isLoading: false,
          hasError: true,
        })
      })
  }, [])

  return beregning
}

export function Pensjonsberegning() {
  const beregning = usePensjonsberegning()

  if (beregning.isLoading) {
    return <Loader data-testid="loader" />
  } else if (beregning.hasError || beregning.data.length === 0) {
    return (
      <Alert variant="error">
        Vi klarte ikke å kalkulere pensjonen din. Prøv igjen senere.
      </Alert>
    )
  }

  return (
    <section className={styles.sammenligning}>
      <BodyLong>
        Hvis du fortsetter å ha samme inntekt som du har i dag kan du tidligst
        gå av med pensjon ved <b>{beregning.data[0].alder} år</b> hvor du vil få
        utbetalt <b>{beregning.data[0].pensjonsbeloep} kroner</b> i året
      </BodyLong>
      {beregning.data[1] && (
        <BodyLong>
          Dersom du jobber frem til du er <b>{beregning.data[1].alder} år</b>,
          vil du få <b>{beregning.data[1].pensjonsbeloep} kroner</b> utbetalt
        </BodyLong>
      )}
      {beregning.data[2] && (
        <BodyLong>
          Dersom du jobber frem til du er <b>{beregning.data[2].alder} år</b>,
          vil du få <b>{beregning.data[2].pensjonsbeloep} kroner</b> utbetalt
        </BodyLong>
      )}
    </section>
  )
}
