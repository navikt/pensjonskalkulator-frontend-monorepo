import { useRouteError, isRouteErrorResponse } from 'react-router-dom'

import { ErrorPage404 } from './ErrorPage404'
import { ErrorPageUnexpected } from './ErrorPageUnexpected'

export const RouteErrorBoundary = () => {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <ErrorPage404 />
  }

  return <ErrorPageUnexpected />
}
