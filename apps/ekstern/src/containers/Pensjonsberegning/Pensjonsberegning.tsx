import React, { useState } from 'react'

import { Alert, Heading } from '@navikt/ds-react'

import { Pensjonssimulering } from '../../components/Pensjonssimulering'
import { Card } from '@/components/Card'
import { Forbehold } from '@/components/Forbehold'
import { Grunnlag } from '@/components/Grunnlag'
import { Loader } from '@/components/Loader'
import { TidligstMuligUttaksalder } from '@/components/TidligstMuligUttaksalder'
import { VelgUttaksalder } from '@/components/VelgUttaksalder'
import { useGetTidligsteMuligeUttaksalderQuery } from '@/state/api/apiSlice'

export function Pensjonsberegning() {
  const {
    data: tidligstMuligUttak,
    isLoading,
    isError,
    isSuccess,
  } = useGetTidligsteMuligeUttaksalderQuery()

  // TODO vurdere om denne skal lagres i Redux store for å minske prop drilling
  const [valgtUttaksalder, setValgtUttaksalder] = useState<string | undefined>()

  if (isLoading) {
    return (
      <Loader
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
          Vi klarte ikke å hente din tidligste mulige uttaksalder. Prøv igjen
          senere.
        </Heading>
      </Alert>
    )
  }

  return (
    <>
      <TidligstMuligUttaksalder uttaksalder={tidligstMuligUttak} />

      <Card>
        <VelgUttaksalder
          tidligstMuligUttak={tidligstMuligUttak}
          valgtUttaksalder={valgtUttaksalder}
          setValgtUttaksalder={setValgtUttaksalder}
        />

        {valgtUttaksalder && (
          <Pensjonssimulering uttaksalder={parseInt(valgtUttaksalder, 10)} />
        )}
      </Card>

      {valgtUttaksalder && (
        <>
          <Grunnlag tidligstMuligUttak={tidligstMuligUttak} />
          <Forbehold />
        </>
      )}
    </>
  )
}
