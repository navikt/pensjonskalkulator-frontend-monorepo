import React, { useMemo, useRef, useState } from 'react'

import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons'
import { Button, Chips, Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import { getFormaterteAldere } from './utils'

import styles from './VelgUttaksalder.module.scss'

interface Props {
  tidligstMuligUttak: Uttaksalder
  valgtUttaksalder?: string
  setValgtUttaksalder: (alder: string) => void
  defaultAntallSynligeAldere?: number
  visFlereAldereLabelClose?: string
  visFlereAldereLabelOpen?: string
}

export const VelgUttaksalder: React.FC<Props> = ({
  tidligstMuligUttak,
  valgtUttaksalder,
  setValgtUttaksalder,
  defaultAntallSynligeAldere = 9,
  visFlereAldereLabelClose = 'Vis flere aldere',
  visFlereAldereLabelOpen = 'Vis færre aldere',
}) => {
  const pinRef = useRef<HTMLDivElement>(null)
  const formaterteAldere = useMemo(
    () => getFormaterteAldere(tidligstMuligUttak),
    [tidligstMuligUttak]
  )
  const [isFlereAldereOpen, setIsFlereAldereOpen] = useState<boolean>(false)

  const onAlderClick = (alderChip: string) => {
    setValgtUttaksalder(alderChip)
    pinRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.wrapper}>
      <span ref={pinRef} className={styles.pin}></span>
      <Heading size="xsmall" level="2">
        Når vil du ta ut alderspensjon?
      </Heading>
      <Chips className={clsx(styles.chipsWrapper, styles.chipsWrapper__hasGap)}>
        {formaterteAldere
          .slice(
            0,
            isFlereAldereOpen
              ? formaterteAldere.length
              : defaultAntallSynligeAldere
          )
          .map((alderChip) => (
            <Chips.Toggle
              selected={valgtUttaksalder === alderChip}
              key={alderChip}
              onClick={() => onAlderClick(alderChip)}
            >
              {alderChip}
            </Chips.Toggle>
          ))}
      </Chips>
      {formaterteAldere.length > defaultAntallSynligeAldere && (
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
          size="xsmall"
          variant="tertiary"
          onClick={() => {
            setIsFlereAldereOpen((prevState) => !prevState)
          }}
        >
          {isFlereAldereOpen
            ? visFlereAldereLabelOpen
            : visFlereAldereLabelClose}
        </Button>
      )}
    </div>
  )
}
