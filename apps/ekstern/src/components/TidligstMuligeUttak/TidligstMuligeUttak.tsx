import React from 'react'

import { Alert, BodyLong, Heading, Loader, ReadMore } from '@navikt/ds-react'

import { useGetTidligsteMuligeUttaksalderQuery } from '@/state/api/apiSlice'

import styles from './TidligstMuligeUttak.module.scss'

export function TidligstMuligeUttak() {
  const { data, isLoading, isError, isSuccess } =
    useGetTidligsteMuligeUttaksalderQuery()
  if (isLoading) {
    return (
      <Loader
        className={styles.loader}
        data-testid="loader"
        size="3xlarge"
        title="Henter tidligste mulige uttaksalder"
      />
    )
  }

  if (isError || !isSuccess) {
    return (
      <Alert variant="error">
        <Heading spacing size="small" level="2">
          Vi klarte ikke å hente tidligste mulige uttaksladeren din. Prøv igjen
          senere.
        </Heading>
      </Alert>
    )
  }

  return (
    <>
      {
        // TODO logikk for setningen dersom det er 0 måned
      }
      <Heading size="medium" level="2">
        Når kan du ta ut alderspensjon?
      </Heading>
      <BodyLong className={styles.paragraph}>
        Du kan tidligst ta ut alderspensjon når du er {data.aar} år og{' '}
        {data.maaned}. Hvis du går av senere, får du høyere pensjon i året.
      </BodyLong>
      <ReadMore header="Hva avgjør tidligste uttakstidspunkt?">
        {'//TODO'}
      </ReadMore>
    </>
  )
}
