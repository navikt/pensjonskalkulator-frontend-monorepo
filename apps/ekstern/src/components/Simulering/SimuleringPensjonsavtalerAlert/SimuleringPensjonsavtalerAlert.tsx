import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Alert, Link } from '@navikt/ds-react'

import { BeregningContext } from '@/pages/Beregning/context'
import { getFormatMessageValues } from '@/utils/translations'

import { PensjonsAvtalerAlertProps, usePensjonsavtalerAlerts } from '../hooks'

import styles from './SimuleringPensjonsavtalerAlert.module.scss'

const ALERT_VARIANTS = {
  INFO: 'info',
  WARNING: 'warning',
  INLINE_INFO: 'inline-info',
} as const

export const SimuleringPensjonsavtalerAlert: React.FC<
  PensjonsAvtalerAlertProps
> = ({
  pensjonsavtaler,
  offentligTp,
  isPensjonsavtaleFlagVisible,
  erOffentligTpFoer1963,
}) => {
  const { pensjonsavtalerShowMoreRef } = React.useContext(BeregningContext)

  const alertsList = usePensjonsavtalerAlerts({
    pensjonsavtaler,
    offentligTp,
    isPensjonsavtaleFlagVisible,
    erOffentligTpFoer1963,
  })

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

  if (!alertsList.length) {
    return null
  }

  return (
    <>
      {alertsList.map((alert, index) => (
        <Alert
          key={`${alert.text}-${alert.variant}-${index}`}
          variant={
            alert.variant === ALERT_VARIANTS.INLINE_INFO
              ? ALERT_VARIANTS.INFO
              : alert.variant
          }
          data-testid="pensjonsavtaler-alert"
          data-intl={alert.text}
          className={styles.alert}
          {...(index === 1 && { style: { margin: '16px 0' } })}
          inline={alert.variant === ALERT_VARIANTS.INLINE_INFO}
          role="alert"
        >
          <FormattedMessage
            id={alert.text}
            values={{
              ...getFormatMessageValues(),
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
      ))}
    </>
  )
}
