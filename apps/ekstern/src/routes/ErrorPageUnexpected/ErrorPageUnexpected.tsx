import { Card } from '@/components/components/Card'
import { PageFramework } from '@/components/components/PageFramework'
import { externalUrls } from '@/routes'

export function ErrorPageUnexpected() {
  const onReload = (): void => {
    window.location.reload()
  }

  const onCancel = (): void => {
    window.location.href = externalUrls.dinPensjon
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
