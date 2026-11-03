import { SanityAlert } from '@pensjonskalkulator-frontend-monorepo/sanity/SanityAlert'

import { ALERT_VIST } from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'

import styles from './ApotekereWarning.module.scss'

export const ApotekereWarning = ({ showWarning }: { showWarning: boolean }) => {
  if (!showWarning) return null

  logger(ALERT_VIST, {
    tekst:
      'Beregning med AFP for apotekvirksomhet (POA) er for øyeblikket feil',
    variant: 'warning',
  })

  return (
    <SanityAlert
      id="apoteker.beregning-med-afp-feil"
      className={styles.alertWrapper}
      role="alert"
    />
  )
}
