import React from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'

import { Alert, Heading } from '@navikt/ds-react'

import styles from './RouteErrorBoundary.module.scss'

const GlobalFeilmelding: React.FC = () => (
  <div className={styles.wrapper} data-testid="error-boundary">
    <Alert variant="error">
      <Heading spacing size="small" level="1">
        Oisann!
      </Heading>
      Det har oppstått en feil. Prøv igjen senere.
    </Alert>
  </div>
)

const PageNotFound = () => (
  <div className={styles.wrapper} data-testid="error-boundary">
    <Heading spacing size="small" level="1">
      Oops!
    </Heading>
    Denne siden finnes ikke
  </div>
)

export const RouteErrorBoundary = () => {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <PageNotFound />
  }

  return <GlobalFeilmelding />
}
