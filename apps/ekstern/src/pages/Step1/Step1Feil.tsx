import { useNavigate } from 'react-router-dom'

import { Card } from '@/components/common/Card'
import { externalUrls } from '@/router'
import { paths } from '@/router/routes'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step1Feil() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.login)
  }

  const onNext = (): void => {
    window.open(externalUrls.detaljertKalkulator, '_self')
  }

  return (
    <Card aria-live="polite" hasLargePadding hasMargin>
      <Card.Content
        text={{
          header: 'stegvisning.utenlandsopphold.error.title',
          ingress: 'stegvisning.utenlandsopphold.error.ingress',
          primaryButton: 'stegvisning.utenlandsopphold.error.button.primary',
          secondaryButton: 'error.global.button.secondary',
        }}
        onPrimaryButtonClick={onNext}
        onSecondaryButtonClick={onCancel}
      />
    </Card>
  )
}
