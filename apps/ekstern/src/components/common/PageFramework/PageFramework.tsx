import React from 'react'
import { useIntl } from 'react-intl'
import { Await, useLoaderData, useLocation } from 'react-router'

import { Loader } from '@/components/common/Loader'
import { HOST_BASEURL } from '@/paths'
import { AuthenticationGuardLoader, LoginContext } from '@/router/loaders'

import { CheckLoginOnFocus } from './CheckLoginOnFocus'
import { FrameComponent } from './FrameComponent'

function RedirectElement() {
  React.useEffect(() => {
    window.open(
      `${HOST_BASEURL}/oauth2/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      '_self'
    )
  }, [])

  React.useEffect(() => {
    // Håndter tilbakeknapp i browser, bfcache - https://web.dev/articles/bfcache
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload()
      }
    }
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [])

  return <span data-testid="redirect-element" />
}

export const PageFramework: React.FC<{
  isFullWidth?: boolean
  hasWhiteBg?: boolean
  hasToggleBg?: boolean
  shouldShowLogo?: boolean
  shouldRedirectNonAuthenticated?: boolean
  children?: React.JSX.Element
}> = (props) => {
  const { shouldRedirectNonAuthenticated = true, children, ...rest } = props
  const intl = useIntl()
  const { pathname } = useLocation()

  const { authResponse } = useLoaderData() as AuthenticationGuardLoader

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <React.Suspense
      fallback={
        <Loader
          data-testid="pageframework-loader"
          size="3xlarge"
          title={intl.formatMessage({ id: 'pageframework.loading' })}
        />
      }
    >
      {/* Når det oppstår er en feil ved fetch: Hvis det er påkrevd å være
      pålogget rediriger til login, hvis ikke "fails silently" og vis siden som
      vanlig og sett isLoggedIn til false */}
      <Await
        resolve={authResponse}
        errorElement={
          shouldRedirectNonAuthenticated ? (
            <RedirectElement />
          ) : (
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
      >
        {(resp: Response) => {
          return shouldRedirectNonAuthenticated && !resp.ok ? (
            <RedirectElement />
          ) : (
            <CheckLoginOnFocus
              shouldRedirectNonAuthenticated={shouldRedirectNonAuthenticated}
            >
              <FrameComponent {...rest}>
                {children &&
                  React.cloneElement(children, {
                    context: {
                      isLoggedIn: resp.ok,
                    } satisfies LoginContext,
                  })}
              </FrameComponent>
            </CheckLoginOnFocus>
          )
        }}
      </Await>
    </React.Suspense>
  )
}

export default PageFramework
