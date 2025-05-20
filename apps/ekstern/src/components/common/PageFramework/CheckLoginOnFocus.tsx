/* eslint-disable @typescript-eslint/no-misused-promises */
import React from 'react'

import { HOST_BASEURL } from '@/paths'

export const CheckLoginOnFocus: React.FC<{
  shouldRedirectNonAuthenticated: boolean
  children: React.JSX.Element
}> = ({ shouldRedirectNonAuthenticated, children }) => {
  React.useEffect(() => {
    const onFocus = async () => {
      /* c8 ignore next 3 */
      const res = await fetch(`${HOST_BASEURL}/oauth2/session`)
      if (shouldRedirectNonAuthenticated && !res.ok) {
        window.open(
          `${HOST_BASEURL}/oauth2/login?redirect=${encodeURIComponent(
            window.location.pathname
          )}`,
          '_self'
        )
      }
    }
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [])
  return children
}
