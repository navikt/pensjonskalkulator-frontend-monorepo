import React, { useMemo, useState } from 'react'

import {
  Alert,
  Chips,
  Heading,
  Ingress,
  Loader,
  ReadMore,
} from '@navikt/ds-react'
import clsx from 'clsx'

import { Pensjonssimulering } from '../Pensjonssimulering'
import { Card } from '@/components/Card'
import { Grunnlag } from '@/components/Grunnlag'
import { useGetTidligsteMuligeUttaksalderQuery } from '@/state/api/apiSlice'

import { formatUttaksalder, generateAlderArray } from './utils'

import styles from './Pensjonsberegning.module.scss'

const useAlderChips = (data?: Uttaksalder, maksalder = 77): string[] =>
  useMemo(
    () =>
      data?.aar
        ? generateAlderArray(
            data.aar,
            maksalder,
            formatUttaksalder(data, { compact: true })
          )
        : [],
    [data]
  )

export function Pensjonsberegning() {
  const {
    data: tidligstMuligUttak,
    isLoading,
    isError,
    isSuccess,
  } = useGetTidligsteMuligeUttaksalderQuery()
  const [valgtUttaksalder, setValgtUttaksalder] = useState<string | undefined>()

  const alderChips = useAlderChips(tidligstMuligUttak)

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
          Vi klarte ikke å hente din tidligste mulige uttaksalder. Prøv igjen
          senere.
        </Heading>
      </Alert>
    )
  }

  return (
    <>
      <Card data-testid="tidligst-mulig-uttak">
        <Ingress>
          Du kan tidligst ta ut alderspensjon når du er{' '}
          {formatUttaksalder(tidligstMuligUttak)}. Hvis du går av senere, får du
          høyere pensjon i året.
        </Ingress>
      </Card>

      <Card className={styles.section}>
        <Heading size="xsmall" level="2">
          Når vil du ta ut alderspensjon?
        </Heading>
        <Chips
          className={clsx(styles.chipsWrapper, styles.chipsWrapper__hasGap)}
        >
          {alderChips.length > 0 &&
            alderChips.slice(0, 6).map((alderChip) => (
              <Chips.Toggle
                selected={valgtUttaksalder === alderChip}
                key={alderChip}
                onClick={() => setValgtUttaksalder(alderChip)}
              >
                {alderChip}
              </Chips.Toggle>
            ))}
        </Chips>
        <ReadMore
          header="Vis flere aldere"
          className={clsx({ [styles.readMore__hasPadding]: valgtUttaksalder })}
        >
          <Chips
            className={clsx(styles.chipsWrapper, styles.chipsWrapper__hasGap)}
          >
            {alderChips.length > 0 &&
              alderChips.slice(6, alderChips.length).map((alderChip) => (
                <Chips.Toggle
                  selected={valgtUttaksalder === alderChip}
                  key={alderChip}
                  onClick={() => setValgtUttaksalder(alderChip)}
                >
                  {alderChip}
                </Chips.Toggle>
              ))}
          </Chips>
        </ReadMore>
        {valgtUttaksalder && (
          <>
            <Pensjonssimulering uttaksalder={parseInt(valgtUttaksalder, 10)} />
            <ReadMore
              header="Vis tabell"
              className={styles.readMore__isCentered}
            >
              {'// TODO'}
            </ReadMore>
          </>
        )}
      </Card>

      {valgtUttaksalder && <Grunnlag tidligstMuligUttak={tidligstMuligUttak} />}
    </>
  )
}
