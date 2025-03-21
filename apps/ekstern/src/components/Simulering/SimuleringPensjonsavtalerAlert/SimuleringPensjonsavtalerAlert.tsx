import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Alert, Link } from '@navikt/ds-react'

import { BeregningContext } from '@/pages/Beregning/context'
import { useAppSelector } from '@/state/hooks'
import { selectIsEndring } from '@/state/userInput/selectors'
import { logger } from '@/utils/logging'

import styles from './SimuleringPensjonsavtalerAlert.module.scss'

interface Props {
  pensjonsavtaler: {
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    data?: {
      avtaler: Pensjonsavtale[]
      partialResponse: boolean
    }
  }
  offentligTp: {
    isError: boolean
    data?: OffentligTp
  }
  isPensjonsavtaleFlagVisible: boolean
}

export const SimuleringPensjonsavtalerAlert: React.FC<Props> = ({
  pensjonsavtaler,
  offentligTp,
  isPensjonsavtaleFlagVisible,
}) => {
  const intl = useIntl()
  const { pensjonsavtalerShowMoreRef } = React.useContext(BeregningContext)
  const isEndring = useAppSelector(selectIsEndring)
  const {
    isLoading: isPensjonsavtalerLoading,
    isSuccess: isPensjonsavtalerSuccess,
    isError: isPensjonsavtalerError,
    data: pensjonsavtalerData,
  } = pensjonsavtaler
  const { isError: isOffentligTpError, data: offentligTpData } = offentligTp

  const alert = React.useMemo(():
    | { variant: 'info' | 'warning' | 'inline-info'; text: string }
    | undefined => {
    const isPartialWith0Avtaler =
      pensjonsavtalerData?.partialResponse &&
      pensjonsavtalerData?.avtaler.length === 0

    const isOffentligTpUkomplett =
      offentligTpData?.simuleringsresultatStatus ===
        'TOM_SIMULERING_FRA_TP_ORDNING' ||
      offentligTpData?.simuleringsresultatStatus === 'TEKNISK_FEIL'

    const isOffentligTpOK =
      offentligTpData &&
      (offentligTpData.simuleringsresultatStatus === 'OK' ||
        offentligTpData.simuleringsresultatStatus ===
          'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING')

    if (isEndring) {
      const text = 'beregning.pensjonsavtaler.alert.endring'
      const variant = 'inline-info'
      logger('alert vist', {
        tekst: `Pensjonsavtaler: ${intl.formatMessage({ id: text })}`,
        variant,
      })
      return {
        variant,
        text,
      }
    }

    // Offentlig-TP OK + Private pensjonsavtaler FEIL/UKOMPLETT
    if (isOffentligTpOK && (isPensjonsavtalerError || isPartialWith0Avtaler)) {
      const text = 'beregning.pensjonsavtaler.alert.privat.error'
      const variant = 'warning'
      logger('alert vist', {
        tekst: `Pensjonsavtaler: ${intl.formatMessage({ id: text })}`,
        variant,
      })
      return {
        variant,
        text,
      }
    }

    // Offentlig-TP FEIL/UKOMPLETT eller at TP_ORDNING støttes ikke + Private pensjonsavtaler FEIL/UKOMPLETT
    if (
      (isOffentligTpError ||
        isOffentligTpUkomplett ||
        offentligTpData?.simuleringsresultatStatus ===
          'TP_ORDNING_STOETTES_IKKE') &&
      (isPensjonsavtalerError || isPartialWith0Avtaler)
    ) {
      const text = 'beregning.pensjonsavtaler.alert.privat_og_offentlig.error'
      const variant = 'warning'
      logger('alert vist', {
        tekst: `Pensjonsavtaler: ${intl.formatMessage({ id: text })}`,
        variant,
      })
      return {
        variant,
        text,
      }
    }

    // Offentlig-TP FEIL/UKOMPLETT + Private pensjonsavtaler OK
    if (
      (isOffentligTpError || isOffentligTpUkomplett) &&
      isPensjonsavtalerSuccess
    ) {
      const text = 'beregning.pensjonsavtaler.alert.offentlig.error'
      const variant = 'warning'
      logger('alert vist', {
        tekst: `Pensjonsavtaler: ${intl.formatMessage({ id: text })}`,
        variant,
      })
      return {
        variant,
        text,
      }
    }

    // Offentlig-TP OK + Ordning støttes ikke
    if (
      offentligTpData &&
      offentligTpData.simuleringsresultatStatus === 'TP_ORDNING_STOETTES_IKKE'
    ) {
      const text = 'beregning.pensjonsavtaler.alert.stoettes_ikke'
      const variant = 'info'
      logger('alert vist', {
        tekst: `Pensjonsavtaler: ${intl.formatMessage({ id: text })}`,
        variant,
      })
      return {
        variant,
        text,
      }
    }

    if (!isPensjonsavtalerLoading && isPensjonsavtaleFlagVisible) {
      const text = 'beregning.pensjonsavtaler.alert.avtaler_foer_alder'
      const variant = 'inline-info'
      logger('alert vist', {
        tekst: `Pensjonsavtaler: ${intl.formatMessage({ id: text })}`,
        variant,
      })
      return {
        variant,
        text,
      }
    }
  }, [
    isPensjonsavtaleFlagVisible,
    isPensjonsavtalerSuccess,
    isPensjonsavtalerError,
    pensjonsavtalerData,
    isOffentligTpError,
    offentligTpData,
  ])

  const handlePensjonsavtalerLinkClick: React.MouseEventHandler<
    HTMLAnchorElement
  > = (e): void => {
    e.preventDefault()
    if (pensjonsavtalerShowMoreRef?.current) {
      pensjonsavtalerShowMoreRef?.current?.focus()
    } else {
      const pensjonsavtalerHeader = document.getElementById(
        'pensjonsavtaler-heading'
      )
      if (pensjonsavtalerHeader) {
        window.scrollTo({
          top: pensjonsavtalerHeader.offsetTop - 15,
          behavior: 'smooth',
        })
      }
    }
  }

  if (alert === undefined) {
    return null
  }

  return (
    <Alert
      variant={alert.variant === 'inline-info' ? 'info' : alert.variant}
      data-testid="pensjonsavtaler-alert"
      className={styles.alert}
      inline={alert.variant === 'inline-info'}
    >
      <FormattedMessage
        id={alert.text}
        values={{
          // eslint-disable-next-line react/no-unstable-nested-components
          scrollTo: (chunk) => (
            <Link
              href="#"
              data-testid="pensjonsavtaler-alert-link"
              onClick={handlePensjonsavtalerLinkClick}
            >
              {chunk}
            </Link>
          ),
        }}
      />
    </Alert>
  )
}
