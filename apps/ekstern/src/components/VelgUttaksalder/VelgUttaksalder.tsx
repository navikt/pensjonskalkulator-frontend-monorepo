import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Chips, Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectNedreAldersgrense,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { unformatUttaksalder } from '@/utils/alder'
import { logger } from '@/utils/logging'

import { getFormaterteAldere } from './utils'

import styles from './VelgUttaksalder.module.scss'

interface Props {
  tidligstMuligUttak?: Alder
}

export const VelgUttaksalder: React.FC<Props> = ({
  tidligstMuligUttak = { ...useAppSelector(selectNedreAldersgrense) },
}) => {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const pinRef = React.useRef<HTMLDivElement>(null)

  const { uttaksalder } = useAppSelector(selectCurrentSimulation)

  const formaterteAldere = React.useMemo(
    () =>
      getFormaterteAldere(intl, tidligstMuligUttak, { aar: 75, maaneder: 0 }),
    [tidligstMuligUttak]
  )

  const onAlderClick = (formatertAlder: string) => {
    logger('chip valgt', {
      tekst: 'Velg uttaksalder',
      data: formatertAlder,
    })
    const alder = unformatUttaksalder(formatertAlder)
    dispatch(userInputActions.setCurrentSimulationUttaksalder(alder))
    pinRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.wrapperCard}>
        <span ref={pinRef} className={styles.pin}></span>
        <Heading size="xsmall" level="2">
          <FormattedMessage id="velguttaksalder.title" />
        </Heading>
        <Chips
          className={clsx(styles.chipsWrapper, styles.chipsWrapper__hasGap)}
        >
          {formaterteAldere
            .slice(0, formaterteAldere.length)
            .map((alderChip) => {
              const { aar, maaneder } = unformatUttaksalder(alderChip)
              return (
                <Chips.Toggle
                  selected={
                    uttaksalder?.aar === aar &&
                    uttaksalder?.maaneder === maaneder
                  }
                  checkmark={false}
                  key={alderChip}
                  onClick={() => onAlderClick(alderChip)}
                >
                  {alderChip}
                </Chips.Toggle>
              )
            })}
        </Chips>
      </div>
    </div>
  )
}
