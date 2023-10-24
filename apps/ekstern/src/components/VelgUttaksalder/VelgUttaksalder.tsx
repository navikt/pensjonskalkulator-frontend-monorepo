import React from 'react'

import { Chips, Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectFormatertUttaksalder } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { logger } from '@/utils/logging'

import { DEFAULT_TIDLIGST_UTTAKSALDER, getFormaterteAldere } from './utils'

import styles from './VelgUttaksalder.module.scss'

interface Props {
  tidligstMuligUttak?: Alder
}

export const VelgUttaksalder: React.FC<Props> = ({
  tidligstMuligUttak = { ...DEFAULT_TIDLIGST_UTTAKSALDER },
}) => {
  const dispatch = useAppDispatch()
  const pinRef = React.useRef<HTMLDivElement>(null)
  const formatertUttaksalder = useAppSelector(selectFormatertUttaksalder)

  const formaterteAldere = React.useMemo(
    () => getFormaterteAldere(tidligstMuligUttak),
    [tidligstMuligUttak]
  )

  const onAlderClick = (alder: string) => {
    logger('chip valgt', {
      tekst: 'Velg uttaksalder alder',
      data: alder,
    })
    dispatch(userInputActions.setFormatertUttaksalder(alder))
    pinRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.wrapperCard}>
        <span ref={pinRef} className={styles.pin}></span>
        <Heading size="xsmall" level="2">
          Når vil du ta ut alderspensjon?
        </Heading>
        <Chips
          className={clsx(styles.chipsWrapper, styles.chipsWrapper__hasGap)}
        >
          {formaterteAldere
            .slice(0, formaterteAldere.length)
            .map((alderChip) => (
              <Chips.Toggle
                selected={formatertUttaksalder === alderChip}
                checkmark={false}
                key={alderChip}
                onClick={() => onAlderClick(alderChip)}
              >
                {alderChip}
              </Chips.Toggle>
            ))}
        </Chips>
      </div>
    </div>
  )
}
