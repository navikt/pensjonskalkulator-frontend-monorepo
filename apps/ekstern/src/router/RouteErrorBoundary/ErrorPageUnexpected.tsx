import { useNavigate } from 'react-router-dom'

import { Card } from '@/components/common/Card'
import { PageFramework } from '@/components/common/PageFramework'
import { paths } from '@/router'

export function ErrorPageUnexpected() {
  const navigate = useNavigate()

  const onReload = (): void => {
    window.location.reload()
  }

  const onCancel = (): void => {
    navigate(paths.login)
  }

  return (
    <PageFramework>
      <Card data-testid="error-page-unexpected" hasLargePadding>
        <Card.Content
          text={{
            header: 'error.global.title',
            ingress: 'error.global.ingress',
            primaryButton: 'error.global.button.primary',
            secondaryButton: 'error.global.button.secondary',
          }}
          onPrimaryButtonClick={onReload}
          onSecondaryButtonClick={onCancel}
        />
      </Card>
    </PageFramework>
  )
}
