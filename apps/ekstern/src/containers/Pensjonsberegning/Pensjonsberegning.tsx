import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Alert, Heading } from '@navikt/ds-react'

import { Card } from '@/components/Card'
import { Forbehold } from '@/components/Forbehold'
import { Grunnlag } from '@/components/Grunnlag'
import { Loader } from '@/components/Loader'
import { Pensjonssimulering } from '@/components/Pensjonssimulering'
import { TidligstMuligUttaksalder } from '@/components/TidligstMuligUttaksalder'
import { TilbakeEllerAvslutt } from '@/components/TilbakeEllerAvslutt'
import { VelgUttaksalder } from '@/components/VelgUttaksalder'
import { useTidligsteUttaksalderQuery } from '@/state/api/apiSlice'
import { useAppSelector } from '@/state/hooks'
import { selectSamtykke } from '@/state/userInput/selectors'

export function Pensjonsberegning() {
  const {
    data: tidligstMuligUttak,
    isLoading,
    isError,
    isSuccess,
  } = useTidligsteUttaksalderQuery()
  const navigate = useNavigate()
  const harSamtykket = useAppSelector(selectSamtykke)

  useEffect(() => {
    // Dersom brukeren prøver å aksessere beregningen direkte uten å ha svart på samtykke spørsmålet sendes den til start steget
    if (harSamtykket === null) {
      return navigate('/start')
    }
  }, [])

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

      <TilbakeEllerAvslutt />
    </>
  )
}
