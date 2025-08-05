import { isRouteErrorResponse, useRouteError } from 'react-router'

import { ErrorPage404 } from './ErrorPage404'
import { ErrorPageUnexpected } from './ErrorPageUnexpected'

export const RouteErrorBoundary = () => {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <ErrorPage404 />
  }

  return <ErrorPageUnexpected />
}
