import { SanityAlert } from '@pensjonskalkulator-frontend-monorepo/sanity/SanityAlert'
import React from 'react'

import { useAfpOffentligAlerts } from '../hooks'

import styles from './SimuleringAfpOffentligAlert.module.scss'

interface Props {
  harSamtykketOffentligAFP: boolean | null
  isAfpOffentligLivsvarigSuccess: boolean
  loependeLivsvarigAfpOffentlig?: AfpOffentligLivsvarig
}

export const SimuleringAfpOffentligAlert: React.FC<Props> = ({
  harSamtykketOffentligAFP,
  isAfpOffentligLivsvarigSuccess,
  loependeLivsvarigAfpOffentlig,
}) => {
  const afpOffentligAlert = useAfpOffentligAlerts({
    harSamtykketOffentligAFP,
    isAfpOffentligLivsvarigSuccess,
    loependeLivsvarigAfpOffentlig,
  })

  if (!afpOffentligAlert?.sanityId) {
    return null
  }

  return (
    <SanityAlert id={afpOffentligAlert.sanityId} className={styles.alert} />
  )
}
