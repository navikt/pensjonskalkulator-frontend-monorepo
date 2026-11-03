import { SanityAlert } from '@pensjonskalkulator-frontend-monorepo/sanity/SanityAlert'
import React from 'react'

import { BeregningContext } from '@/pages/Beregning/context'

import { PensjonsAvtalerAlertProps, usePensjonsavtalerAlerts } from '../hooks'

import styles from './SimuleringPensjonsavtalerAlert.module.scss'

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

  if (!alertsList.length) {
    return null
  }

  return (
    <>
      {alertsList.map((alert, index) => (
        <div
          key={`${alert.sanityId}-${alert.variant}-${index}`}
          className={styles.alert}
          data-testid="pensjonsavtaler-alert"
          data-intl={alert.sanityId}
          role="alert"
          {...(index === 1 && { style: { margin: '16px 0' } })}
        >
          <SanityAlert
            id={alert.sanityId}
            onLinkClick={() =>
              pensjonsavtalerShowMoreRef?.current?.focus({ scroll: false })
            }
          />
        </div>
      ))}
    </>
  )
}
