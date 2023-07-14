import { useState } from 'react'

import { Alert, Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import { Loader } from '@/components/components/Loader'
import { Forbehold } from '@/components/Forbehold'
import { Grunnlag } from '@/components/Grunnlag'
import { Pensjonssimulering } from '@/components/Pensjonssimulering'
import { TidligstMuligUttaksalder } from '@/components/TidligstMuligUttaksalder'
import { TilbakeEllerAvslutt } from '@/components/TilbakeEllerAvslutt'
import { VelgUttaksalder } from '@/components/VelgUttaksalder'
import { useTidligsteUttaksalderQuery } from '@/state/api/apiSlice'

import styles from './Pensjonsberegning.module.scss'

export function Pensjonsberegning() {
  const {
    data: tidligstMuligUttak,
    isLoading,
    isError,
    isSuccess,
  } = useTidligsteUttaksalderQuery()

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
      <div className={styles.container}>
        <TidligstMuligUttaksalder uttaksalder={tidligstMuligUttak} />
      </div>
      {
        // TODO etter merge - dette flyttes ut slik at containeren ikke har styles
      }
      <div
        className={clsx(styles.background, styles.background__hasMargin, {
          [styles.background__white]: valgtUttaksalder,
        })}
      >
        <div className={styles.container}>
          <VelgUttaksalder
            tidligstMuligUttak={tidligstMuligUttak}
            valgtUttaksalder={valgtUttaksalder}
            setValgtUttaksalder={setValgtUttaksalder}
          />
        </div>

        {valgtUttaksalder && (
          <div
            className={`${styles.container} ${styles.container__hasPadding}`}
          >
            <Pensjonssimulering uttaksalder={parseInt(valgtUttaksalder, 10)} />
            <Grunnlag tidligstMuligUttak={tidligstMuligUttak} />
            <Forbehold />
          </div>
        )}
      </div>

      <div className={`${styles.background} ${styles.background__lightblue}`}>
        <div className={styles.container}>
          <TilbakeEllerAvslutt />
        </div>
      </div>
    </>
  )
}
