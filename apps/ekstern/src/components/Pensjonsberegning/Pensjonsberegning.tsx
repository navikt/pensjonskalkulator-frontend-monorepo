import React, { useMemo, useState } from 'react'

import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons'
import { Alert, Button, Chips, Heading, Loader } from '@navikt/ds-react'
import clsx from 'clsx'

import { Pensjonssimulering } from '../Pensjonssimulering'
import { Card } from '@/components/Card'
import { Forbehold } from '@/components/Forbehold'
import { Grunnlag } from '@/components/Grunnlag'
import { getFormaterteAldere } from '@/components/Pensjonsberegning/utils'
import { TidligstMuligUttaksalder } from '@/components/TidligstMuligUttaksalder'
import { useGetTidligsteMuligeUttaksalderQuery } from '@/state/api/apiSlice'

import styles from './Pensjonsberegning.module.scss'

const DEFAULT_ANTALL_VISIBLE_ALDERCHIPS = 9
const VIS_FLERE__ALDERE_LABEL_CLOSE = 'Vis flere aldere'
const VIS_FLERE__ALDERE_LABEL_OPEN = 'Vis færre aldere'

export function Pensjonsberegning() {
  const {
    data: tidligstMuligUttak,
    isLoading,
    isError,
    isSuccess,
  } = useGetTidligsteMuligeUttaksalderQuery()

  const [isFlereAldereOpen, setIsFlereAldereOpen] = useState<boolean>(false)

  const [valgtUttaksalder, setValgtUttaksalder] = useState<string | undefined>()

  const formaterteAldere = useMemo(
    () => (tidligstMuligUttak ? getFormaterteAldere(tidligstMuligUttak) : []),
    [tidligstMuligUttak]
  )

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
      <TidligstMuligUttaksalder uttaksalder={tidligstMuligUttak} />

      <Card className={styles.section}>
        <Heading size="xsmall" level="2">
          Når vil du ta ut alderspensjon?
        </Heading>
        <Chips
          className={clsx(styles.chipsWrapper, styles.chipsWrapper__hasGap)}
        >
          {formaterteAldere
            .slice(
              0,
              isFlereAldereOpen
                ? formaterteAldere.length
                : DEFAULT_ANTALL_VISIBLE_ALDERCHIPS
            )
            .map((alderChip) => (
              <Chips.Toggle
                selected={valgtUttaksalder === alderChip}
                key={alderChip}
                onClick={() => setValgtUttaksalder(alderChip)}
              >
                {alderChip}
              </Chips.Toggle>
            ))}
        </Chips>
        <Button
          className={styles.visFlereAldere}
          icon={
            isFlereAldereOpen ? (
              <ChevronUpIcon aria-hidden />
            ) : (
              <ChevronDownIcon aria-hidden />
            )
          }
          iconPosition="left"
          size={'xsmall'}
          variant="tertiary"
          onClick={() => {
            setIsFlereAldereOpen(!isFlereAldereOpen)
          }}
        >
          {isFlereAldereOpen
            ? VIS_FLERE__ALDERE_LABEL_OPEN
            : VIS_FLERE__ALDERE_LABEL_CLOSE}
        </Button>

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
