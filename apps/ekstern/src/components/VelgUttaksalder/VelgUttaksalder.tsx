import React, { useMemo, useState } from 'react'

import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons'
import { Button, Chips, Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import {
  DEFAULT_ANTALL_VISIBLE_ALDERCHIPS,
  VIS_FLERE__ALDERE_LABEL_CLOSE,
  VIS_FLERE__ALDERE_LABEL_OPEN,
  getFormaterteAldere,
} from './utils'

import styles from './VelgUttaksalder.module.scss'

interface Props {
  tidligstMuligUttak: Uttaksalder
  valgtUttaksalder?: string
  setValgtUttaksalder: (s: string) => void
}

export const VelgUttaksalder: React.FC<Props> = ({
  tidligstMuligUttak,
  valgtUttaksalder,
  setValgtUttaksalder,
}) => {
  const formaterteAldere = useMemo(
    () => getFormaterteAldere(tidligstMuligUttak),
    [tidligstMuligUttak]
  )
  const [isFlereAldereOpen, setIsFlereAldereOpen] = useState<boolean>(false)

  return (
    <div className={styles.wrapper}>
      <Heading size="xsmall" level="2">
        Når vil du ta ut alderspensjon?
      </Heading>
      <Chips className={clsx(styles.chipsWrapper, styles.chipsWrapper__hasGap)}>
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
    </div>
  )
}
