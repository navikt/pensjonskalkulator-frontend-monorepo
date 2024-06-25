import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Card } from '@/components/common/Card'
import { onStegvisningCancel } from '@/components/stegvisning/stegvisning-utils'
import { useAppDispatch } from '@/state/hooks'

export function StepFeil() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.uventet_feil',
    })
  }, [])

  const onCancel = (): void => {
    onStegvisningCancel(dispatch, navigate)
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
          header: 'error.global.title',
          ingress: 'error.global.ingress',
          primaryButton: 'error.global.button',
        }}
        onPrimaryButtonClick={onCancel}
      />
    </Card>
  )
}
