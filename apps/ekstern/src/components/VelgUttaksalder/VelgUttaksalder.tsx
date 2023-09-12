import React from 'react'

import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons'
import { Button, Chips, Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectFormatertUttaksalder } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { logger } from '@/utils/logging'
import { isViewPortMobile } from '@/utils/viewport'

import { DEFAULT_TIDLIGST_UTTAKSALDER, getFormaterteAldere } from './utils'

import styles from './VelgUttaksalder.module.scss'

interface Props {
  tidligstMuligUttak?: Uttaksalder | UttaksalderForenklet
  defaultAntallSynligeAldere?: number
  visFlereAldereLabelClose?: string
  visFlereAldereLabelOpen?: string
}

// TODO PEK-119 utvide test optional tidligstMuligUttak
export const VelgUttaksalder: React.FC<Props> = ({
  tidligstMuligUttak = { ...DEFAULT_TIDLIGST_UTTAKSALDER },
  defaultAntallSynligeAldere = 9,
  visFlereAldereLabelClose = 'Vis flere aldere',
  visFlereAldereLabelOpen = 'Vis færre aldere',
}) => {
  const dispatch = useAppDispatch()
  const pinRef = React.useRef<HTMLDivElement>(null)
  const formatertUttaksalder = useAppSelector(selectFormatertUttaksalder)

  const [isMobile, setIsMobile] = React.useState<boolean>(
    isViewPortMobile(window.innerWidth)
  )

  React.useEffect(() => {
    function handleWindowSizeChange() {
      setIsMobile(isViewPortMobile(window.innerWidth))
    }
    window.addEventListener('resize', handleWindowSizeChange)
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange)
    }
  }, [])

  const formaterteAldere = React.useMemo(
    () => getFormaterteAldere(tidligstMuligUttak),
    [tidligstMuligUttak]
  )
  const [isFlereAldereOpen, setIsFlereAldereOpen] =
    React.useState<boolean>(false)

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
            .slice(
              0,
              isMobile && !isFlereAldereOpen
                ? defaultAntallSynligeAldere
                : formaterteAldere.length
            )
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
        {isMobile && formaterteAldere.length > defaultAntallSynligeAldere && (
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
    </div>
  )
}
