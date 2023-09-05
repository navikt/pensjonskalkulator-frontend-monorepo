import React from 'react'

import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons'
import { Button, Chips, Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import { useAppDispatch } from '@/state/hooks'
import { useAppSelector } from '@/state/hooks'
import { selectFormatertUttaksalder } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

import { getFormaterteAldere } from './utils'

import styles from './VelgUttaksalder.module.scss'

interface Props {
  tidligstMuligUttak: Uttaksalder
  defaultAntallSynligeAldere?: number
  visFlereAldereLabelClose?: string
  visFlereAldereLabelOpen?: string
}

export const VelgUttaksalder: React.FC<Props> = ({
  tidligstMuligUttak,
  defaultAntallSynligeAldere = 9,
  visFlereAldereLabelClose = 'Vis flere aldere',
  visFlereAldereLabelOpen = 'Vis færre aldere',
}) => {
  const dispatch = useAppDispatch()
  const pinRef = React.useRef<HTMLDivElement>(null)

  const [isMobile, setIsMobile] = React.useState<boolean>(
    window.innerWidth <= 768
  )

  React.useEffect(() => {
    function handleWindowSizeChange() {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleWindowSizeChange)
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange)
    }
  }, [])

  const formatertUttaksalder = useAppSelector(selectFormatertUttaksalder)

  const formaterteAldere = React.useMemo(
    () => getFormaterteAldere(tidligstMuligUttak),
    [tidligstMuligUttak]
  )
  const [isFlereAldereOpen, setIsFlereAldereOpen] =
    React.useState<boolean>(false)

  const onAlderClick = (alder: string) => {
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
