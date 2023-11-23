import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Card } from '@/components/common/Card'
import { externalUrls, paths } from '@/router'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step1Feil() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step1.feil',
    })
  }, [])

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.login)
  }

  const onNext = (): void => {
    window.open(externalUrls.detaljertKalkulator, '_self')
  }

  return (
    <Card hasLargePadding hasMargin>
      <Card.Content
        text={{
          header: 'stegvisning.utenlandsopphold.error.title',
          ingress: 'stegvisning.utenlandsopphold.error.ingress',
          primaryButton: 'stegvisning.utenlandsopphold.error.button.primary',
          secondaryButton: 'error.global.button',
        }}
        onPrimaryButtonClick={onNext}
        onSecondaryButtonClick={onCancel}
      />
    </Card>
  )
}
