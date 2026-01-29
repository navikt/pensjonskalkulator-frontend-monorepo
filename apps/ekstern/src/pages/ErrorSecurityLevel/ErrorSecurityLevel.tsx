import React from 'react'
import { useIntl } from 'react-intl'

import { Card } from '@/components/common/Card'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { paths } from '@/router/constants'

export const ErrorSecurityLevel = () => {
  const intl = useIntl()

  const [{ onStegvisningCancel }] = useStegvisningNavigation(paths.start)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.securityLevel_feil',
    })
    window.scrollTo(0, 0)
  }, [])

  const redirectToLogin = () => {
    const redirectUrl = `https://${window.location.host}/pensjon/kalkulator/oauth2/logout?redirect=https://${window.location.host}/pensjon/kalkulator/start`
    window.open(redirectUrl, '_self')
  }

  const redirectToStart = () => {
    onStegvisningCancel()
  }

  return (
    <Card
      data-testid="error-page-security-level"
      aria-live="polite"
      hasLargePadding
      hasMargin
    >
      <Card.Content
        text={{
          loading: 'pageframework.loading',
          header: 'error.securityLevel.title',
          ingress: 'error.securityLevel.ingress',
          primaryButton: 'error.securityLevel.primary_button',
          secondaryButton: 'error.securityLevel.secondary_button',
        }}
        onPrimaryButtonClick={redirectToLogin}
        onSecondaryButtonClick={redirectToStart}
      />
    </Card>
  )
}
