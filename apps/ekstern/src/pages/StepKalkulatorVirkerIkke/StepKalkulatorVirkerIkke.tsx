import React from 'react'
import { useIntl } from 'react-intl'

import { Card } from '@/components/common/Card'
import { externalUrls } from '@/router/constants'

export function StepKalkulatorVirkerIkke() {
  const intl = useIntl()

  const navigateToDinPensjon = () => {
    window.location.href = externalUrls.dinPensjonInnlogget
  }

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.kalkulator_virker_ikke',
    })
  }, [])

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
          header: 'error.virker_ikke.title',
          ingress: 'error.virker_ikke.ingress',
          primaryButton: 'error.virker_ikke.button',
        }}
        onPrimaryButtonClick={navigateToDinPensjon}
      />
    </Card>
  )
}
