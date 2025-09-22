import { FormattedMessage } from 'react-intl'

import { Alert } from '@navikt/ds-react'

import styles from './ApotekereWarning.module.scss'

export const ApotekereWarning = ({ showWarning }: { showWarning: boolean }) => {
  if (!showWarning) return null

  return (
    <Alert
      className={styles.alertWrapper}
      variant="warning"
      data-testid="apotekere-warning"
    >
      <FormattedMessage id="error.apoteker_warning" />
    </Alert>
  )
}
