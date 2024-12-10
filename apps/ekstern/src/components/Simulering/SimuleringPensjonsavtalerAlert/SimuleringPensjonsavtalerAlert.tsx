import React from 'react'
import { FormattedMessage } from 'react-intl'

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
  const { pensjonsavtalerShowMoreRef } = React.useContext(BeregningContext)
  const isEndring = useAppSelector(selectIsEndring)
  const {
    isLoading: isPensjonsavtalerLoading,
    isSuccess: isPensjonsavtalerSuccess,
    isError: isPensjonsavtalerError,
    data: pensjonsavtalerData,
  } = pensjonsavtaler
  const { isError: isOffentligTpError, data: offentligTpData } = offentligTp

  // TODO PEK-812 revidere logging
  React.useEffect(() => {
    if (isOffentligTpError) {
      logger('alert', {
        tekst:
          'TPO infoboks: Vi klarte ikke å sjekke om du har pensjonsavtaler i offentlig sektor',
      })
    }
    // else if (
    //   offentligTp?.data?.muligeTpLeverandoerListe &&
    //   offentligTp?.data?.muligeTpLeverandoerListe.length > 0
    // ) {
    //   logger('alert', {
    //     tekst: 'TPO infoboks: Du kan ha rett til offentlig tjenestepensjon',
    //   })
    // }
  }, [isOffentligTpError])

  const alert = React.useMemo(():
    | { variant: 'info' | 'warning' | 'inline'; text: string }
    | undefined => {
    const isPartialWith0Avtaler =
      pensjonsavtalerData?.partialResponse &&
      pensjonsavtalerData?.avtaler.length === 0

    if (isEndring) {
      return {
        variant: 'inline',
        text: 'beregning.pensjonsavtaler.alert.endring',
      }
    }

    // Offentlig-TP OK + Private pensjonsavtaler FEIL
    if (offentligTpData && (isPensjonsavtalerError || isPartialWith0Avtaler)) {
      return {
        variant: 'warning',
        text: 'beregning.pensjonsavtaler.alert.privat.error',
      }
    }

    // Offentlig-TP OK + Ordning støttes ikke
    if (
      offentligTpData &&
      offentligTpData.simuleringsresultatStatus === 'TP_ORDNING_STOETTES_IKKE'
    ) {
      return {
        variant: 'warning',
        text: 'beregning.pensjonsavtaler.alert.stoettes_ikke',
      }
    }

    // Offentlig-TP FEIL + Private pensjonsavtaler FEIL
    if (
      isOffentligTpError &&
      (isPensjonsavtalerError || isPartialWith0Avtaler)
    ) {
      return {
        variant: 'warning',
        text: 'beregning.pensjonsavtaler.alert.privat_og_offentlig.error',
      }
    }

    // Offentlig-TP FEIL + Private pensjonsavtaler OK
    if (isOffentligTpError && isPensjonsavtalerSuccess) {
      return {
        variant: 'warning',
        text: 'beregning.pensjonsavtaler.alert.offentlig.error',
      }
    }

    if (!isPensjonsavtalerLoading && isPensjonsavtaleFlagVisible) {
      return {
        variant: 'inline',
        text: 'beregning.pensjonsavtaler.alert.avtaler_foer_alder',
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
      variant={alert.variant === 'inline' ? 'info' : alert.variant}
      data-testid="pensjonsavtaler-alert"
      className={styles.alert}
      inline={alert.variant === 'inline'}
    >
      <FormattedMessage
        id={alert.text}
        values={{
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
