import React from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'

import { Heading } from '@navikt/ds-react'

import { ErrorPageUnexpected } from '../ErrorPageUnexpected'

import styles from './RouteErrorBoundary.module.scss'

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

  return <ErrorPageUnexpected />
}
