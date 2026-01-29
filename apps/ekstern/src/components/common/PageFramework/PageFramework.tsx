import React, { useContext, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useLocation, useNavigation } from 'react-router'

import { Loader } from '@/components/common/Loader'
import { SanityContext } from '@/context/SanityContext'
import { HOST_BASEURL } from '@/paths'
import { useAppSelector } from '@/state/hooks'
import { selectIsLoggedIn } from '@/state/session/selectors'

import { CheckLoginOnFocus } from './CheckLoginOnFocus'
import { FrameComponent } from './FrameComponent'

function RedirectElement() {
  useEffect(() => {
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
  noMinHeight?: boolean
  children?: React.JSX.Element
}> = ({
  shouldRedirectNonAuthenticated = true,
  showLoader = true,
  children,
  ...rest
}) => {
  const intl = useIntl()
  const isLoggedIn = useAppSelector(selectIsLoggedIn)
  const { pathname } = useLocation()
  const { state } = useNavigation()
  const { isSanityLoading } = useContext(SanityContext)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (!isLoggedIn && shouldRedirectNonAuthenticated) {
    return <RedirectElement />
  }

  if (showLoader && (state === 'loading' || isSanityLoading)) {
    return (
      <FrameComponent {...rest}>
        <Loader
          data-testid="pageframework-loader"
          size="3xlarge"
          title={intl.formatMessage({ id: 'pageframework.loading' })}
        />
      </FrameComponent>
    )
  }

  return (
    <CheckLoginOnFocus
      shouldRedirectNonAuthenticated={shouldRedirectNonAuthenticated}
    >
      <FrameComponent {...rest}>{children}</FrameComponent>
    </CheckLoginOnFocus>
  )
}

export default PageFramework
