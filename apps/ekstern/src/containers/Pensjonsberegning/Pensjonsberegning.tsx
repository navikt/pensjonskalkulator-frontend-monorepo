import { useState } from 'react'

import { Alert, Heading } from '@navikt/ds-react'

import { Card } from '@/components/Card'
import { Forbehold } from '@/components/Forbehold'
import { Grunnlag } from '@/components/Grunnlag'
import { Loader } from '@/components/Loader'
import { Pensjonssimulering } from '@/components/Pensjonssimulering'
import { TidligstMuligUttaksalder } from '@/components/TidligstMuligUttaksalder'
import { TilbakeEllerAvslutt } from '@/components/TilbakeEllerAvslutt'
import { VelgUttaksalder } from '@/components/VelgUttaksalder'
import { apiSlice } from '@/state/api/apiSlice'
import { useTidligsteUttaksalderQuery } from '@/state/api/apiSlice'
import { useAppSelector } from '@/state/hooks'
import { store } from '@/state/store'
import { selectSamtykke } from '@/state/userInput/selectors'

export function Pensjonsberegning() {
  const harSamtykket = useAppSelector(selectSamtykke)
  const [valgtUttaksalder, setValgtUttaksalder] = useState<string | undefined>()

  const {
    data: tidligstMuligUttak,
    isLoading,
    isError,
    isSuccess,
  } = useTidligsteUttaksalderQuery()

  const pensjonsavtalerRequestBody = {
    uttaksperioder: [
      {
        startAlder: valgtUttaksalder ? parseInt(valgtUttaksalder, 10) : 0,
        startMaaned:
          valgtUttaksalder &&
          tidligstMuligUttak?.maaned &&
          parseInt(valgtUttaksalder, 10) === tidligstMuligUttak?.aar
            ? tidligstMuligUttak?.maaned
            : 1, // Defaulter til 1 for nå - brukeren kan ikke velge spesifikk måned
        grad: 100, // Hardkodet til 100 for nå - brukeren kan ikke velge gradert pensjon
        aarligInntekt: 0, // Hardkodet til 0 for nå - brukeren kan ikke legge til inntekt vsa. pensjon
      },
    ],
    antallInntektsaarEtterUttak: 0,
  }

  const valgtUttaksalderHandler = (alder: string) => {
    setValgtUttaksalder(alder)
    if (harSamtykket) {
      store.dispatch(
        apiSlice.endpoints.pensjonsavtaler.initiate(pensjonsavtalerRequestBody)
      )
    }
  }

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
          valgtUttaksalderHandler={valgtUttaksalderHandler}
        />

        {valgtUttaksalder && (
          <Pensjonssimulering uttaksalder={parseInt(valgtUttaksalder, 10)} />
        )}
      </Card>

      {valgtUttaksalder && (
        <>
          <Grunnlag
            tidligstMuligUttak={tidligstMuligUttak}
            pensjonsavtalerRequestBody={pensjonsavtalerRequestBody}
          />
          <Forbehold />
          <TilbakeEllerAvslutt />
        </>
      )}
    </>
  )
}
