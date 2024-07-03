import React from 'react'
import { useIntl } from 'react-intl'

import { Card } from '@/components/common/Card'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { paths } from '@/router/constants'

export function StepFeil() {
  const intl = useIntl()
  const [{ onStegvisningCancel }] = useStegvisningNavigation(paths.start)

  const a = () => {
    onStegvisningCancel()
  }

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.uventet_feil',
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
          header: 'error.global.title',
          ingress: 'error.global.ingress',
          primaryButton: 'error.global.button',
        }}
        onPrimaryButtonClick={a}
      />
    </Card>
  )
}
