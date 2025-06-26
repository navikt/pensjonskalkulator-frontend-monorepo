import { FormattedMessage } from 'react-intl'

import { Alert } from '@navikt/ds-react'

// TODO: Ikke i bruk enda. Kan tas i bruk når advarsel skal vises for apotekere
export const ApotekereWarning = ({ showWarning }: { showWarning: boolean }) => {
  if (!showWarning) return null

  return (
    <Alert variant="warning" data-testid="apotekere-warning">
      <FormattedMessage id="error.apoteker_warning" />
    </Alert>
  )
}
