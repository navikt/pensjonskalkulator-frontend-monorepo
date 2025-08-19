/* eslint-disable @typescript-eslint/no-misused-promises */
import React from 'react'
import { useDispatch } from 'react-redux'

import { HOST_BASEURL } from '@/paths'
import { sessionActions } from '@/state/session/sessionSlice'

export const CheckLoginOnFocus: React.FC<{
  shouldRedirectNonAuthenticated: boolean
  children: React.JSX.Element
}> = ({ shouldRedirectNonAuthenticated, children }) => {
  const dispatch = useDispatch()

  React.useEffect(() => {
    const onFocus = async () => {
      /* c8 ignore next 3 */
      const res = await fetch(`${HOST_BASEURL}/oauth2/session`)
      dispatch(sessionActions.setLoggedIn(res.ok))
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
  }, [dispatch, shouldRedirectNonAuthenticated])
  return children
}
