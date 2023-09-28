import { useNavigate } from 'react-router-dom'

import { Card } from '@/components/common/Card'
import { PageFramework } from '@/components/common/PageFramework'
import { paths } from '@/router'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function ErrorPageUnexpected() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.login)
  }

  return (
    <PageFramework>
      <Card data-testid="error-page-unexpected" hasLargePadding>
        <Card.Content
          text={{
            header: 'error.global.title',
            ingress: 'error.global.ingress',
            primaryButton: 'error.global.button',
          }}
          onPrimaryButtonClick={onCancel}
        />
      </Card>
    </PageFramework>
  )
}
