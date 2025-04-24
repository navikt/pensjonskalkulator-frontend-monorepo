import React from 'react'
import { useIntl } from 'react-intl'
import { useLoaderData, useLocation, useNavigation } from 'react-router'

import { Loader } from '@/components/common/Loader'
import { HOST_BASEURL } from '@/paths'
import { LoginContext, authenticationGuard } from '@/router/loaders'

import { CheckLoginOnFocus } from './CheckLoginOnFocus'
import { FrameComponent } from './FrameComponent'

function RedirectElement() {
  React.useEffect(() => {
    window.open(
      `${HOST_BASEURL}/oauth2/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      '_self'
    )
  }, [])

  return <div />
}

export const PageFramework: React.FC<{
  isFullWidth?: boolean
  hasWhiteBg?: boolean
  hasToggleBg?: boolean
  shouldShowLogo?: boolean
  shouldRedirectNonAuthenticated?: boolean
  showLoader?: boolean
  children?: React.JSX.Element
}> = ({
  shouldRedirectNonAuthenticated = true,
  showLoader = true,
  children,
  ...rest
}) => {
  const intl = useIntl()
  const { pathname } = useLocation()
  const { state } = useNavigation()
  const { authResponse } = useLoaderData<typeof authenticationGuard>()

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (state === 'loading' && showLoader)
    return (
      <FrameComponent {...rest}>
        <Loader
          data-testid="pageframework-loader"
          size="3xlarge"
          title={intl.formatMessage({ id: 'pageframework.loading' })}
        />
      </FrameComponent>
    )

  // Når det oppstår en feil ved fetch: Hvis det er påkrevd å være pålogget rediriger til login,
  // hvis ikke "fail silently", vis siden som vanlig og sett isLoggedIn til false.
  if (!authResponse.ok) {
    if (shouldRedirectNonAuthenticated) {
      return <RedirectElement />
    }
    return (
      <FrameComponent {...rest}>
        {children &&
          React.cloneElement(children, {
            context: {
              isLoggedIn: false,
            } satisfies LoginContext,
          })}
      </FrameComponent>
    )
  }

  return (
    <CheckLoginOnFocus
      shouldRedirectNonAuthenticated={shouldRedirectNonAuthenticated}
    >
      <FrameComponent {...rest}>
        {children &&
          React.cloneElement(children, {
            context: {
              isLoggedIn: authResponse.ok,
            } satisfies LoginContext,
          })}
      </FrameComponent>
    </CheckLoginOnFocus>
  )
}

export default PageFramework
