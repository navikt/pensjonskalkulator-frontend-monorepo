import React, { useEffect, useState } from 'react'

import {
  Alert,
  BodyLong,
  Chips,
  Heading,
  Loader,
  ReadMore,
} from '@navikt/ds-react'
import clsx from 'clsx'

import { Pensjonssimulering } from '../Pensjonssimulering'
import { generateAlderArray } from '../TidligstMuligeUttak/utils'
import { useGetTidligsteMuligeUttaksalderQuery } from '@/state/api/apiSlice'

import styles from './TidligstMuligeUttak.module.scss'

export function TidligstMuligeUttak() {
  const { data, isLoading, isError, isSuccess } =
    useGetTidligsteMuligeUttaksalderQuery()
  const [valgtUttaksalder, setValgtUttaksalder] = useState<string | undefined>(
    undefined
  )
  const [alderChips, setAlderChips] = useState<string[]>([])

  useEffect(() => {
    if (data && data?.aar) {
      const a = generateAlderArray(data.aar, 77)
      setAlderChips(a)
    }
  }, [data])

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
      <BodyLong className={styles.paragraph}>
        Du kan tidligst ta ut alderspensjon når du er {data.aar} år og{' '}
        {data.maaned}. Hvis du går av senere, får du høyere pensjon i året.
      </BodyLong>
      <ReadMore header="Hva avgjør tidligste uttakstidspunkt?">
        {'//TODO'}
      </ReadMore>
      <Heading size="xsmall" level="2">
        Når vil du ta ut alderspensjon?
      </Heading>
      <Chips className={clsx(styles.chipsWrapper, styles.chipsWrapper__hasGap)}>
        {alderChips.length > 0 &&
          alderChips.slice(0, 6).map((alderChip) => (
            <Chips.Toggle
              selected={valgtUttaksalder === alderChip}
              key={alderChip}
              onClick={() => setValgtUttaksalder(alderChip)}
            >
              {`${alderChip.toString()} år`}
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
                {`${alderChip.toString()} år`}
              </Chips.Toggle>
            ))}
        </Chips>
      </ReadMore>
      {valgtUttaksalder && (
        <Pensjonssimulering uttaksalder={parseInt(valgtUttaksalder, 10)} />
      )}
    </>
  )
}
