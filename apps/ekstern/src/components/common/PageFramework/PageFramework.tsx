import React from 'react'
import { useIntl } from 'react-intl'
import { useLocation, Await } from 'react-router-dom'

import { Loader } from '@/components/common/Loader'
import { HOST_BASEURL } from '@/paths'
import { LoginContext } from '@/router/loaders'
import { useDeferAuthenticationAccessData } from '@/router/loaders'

import { FrameComponent } from './FrameComponent'

// TODO skrive tester
function RedirectElement() {
  React.useEffect(() => {
    window.open(
      `${HOST_BASEURL}/oauth2/login?redirect=${encodeURIComponent(
        window.location.pathname
      )}`,
      '_self'
    )
  }, [])
  return <span data-testid="redirect-element"></span>
}

// TODO skrive tester
const CheckLoginOnFocus: React.FC<{
  shouldRedirectNonAuthenticated: boolean
  children: JSX.Element
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

export const PageFramework: React.FC<{
  isFullWidth?: boolean
  hasWhiteBg?: boolean
  shouldShowLogo?: boolean
  shouldRedirectNonAuthenticated?: boolean
  children?: JSX.Element
}> = (props) => {
  const { shouldRedirectNonAuthenticated = true, children, ...rest } = props
  const intl = useIntl()
  const { pathname } = useLocation()
  const loaderData = useDeferAuthenticationAccessData()

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <React.Suspense
        fallback={
          <Loader
            data-testid="pageframework-loader"
            size="3xlarge"
            title={intl.formatMessage({ id: 'pageframework.loading' })}
          />
        }
      >
        <Await
          resolve={loaderData.oauth2Query}
          errorElement={<RedirectElement />}
        >
          {(oauth2Query: Response) => {
            return shouldRedirectNonAuthenticated && !oauth2Query.ok ? (
              <RedirectElement />
            ) : (
              <CheckLoginOnFocus
                shouldRedirectNonAuthenticated={shouldRedirectNonAuthenticated}
              >
                <FrameComponent {...rest}>
                  {children &&
                    React.cloneElement(children, {
                      context: {
                        isLoggedIn: oauth2Query.ok,
                      } satisfies LoginContext,
                    })}
                </FrameComponent>
              </CheckLoginOnFocus>
            )
          }}
        </Await>
      </React.Suspense>
    </>
  )
}
