import React from 'react'
import { useIntl } from 'react-intl'

import { Card } from '@/components/common/Card'
import { externalUrls } from '@/router/constants'

export const IngenTilgang = () => {
  const intl = useIntl()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.uventet_feil',
    })
  }, [])

  const gaaTilDinPensjon = () => {
    window.open(externalUrls.byttBruker, '_self')
  }

  return (
    <Card
      data-testid="error-step-unexpected"
      aria-live="polite"
      hasLargePadding
      hasMargin
    >
      <Card.Content
        text={{
          loading: 'pageframework.loading',
          header: 'error.fullmakt.title',
          ingress: 'error.fullmakt.ingress',
          primaryButton: 'error.fullmakt.bytt_bruker',
        }}
        onPrimaryButtonClick={gaaTilDinPensjon}
      />
    </Card>
  )
}
