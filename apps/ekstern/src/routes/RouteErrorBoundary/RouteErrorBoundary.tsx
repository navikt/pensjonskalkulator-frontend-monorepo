import React from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'

import { Alert, Heading } from '@navikt/ds-react'

import { ErrorPage404 } from '../ErrorPage404'

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

export const RouteErrorBoundary = () => {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <ErrorPage404 />
  }

  return <GlobalFeilmelding />
}
