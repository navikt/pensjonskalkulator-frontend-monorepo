import React from 'react'

import { Card } from '@/components/common/Card'
import { FrameComponent } from '@/components/common/PageFramework'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { paths } from '@/router/constants'
import { logger } from '@/utils/logging'

export function ErrorPageUnexpected() {
  const [{ onStegvisningCancel }] = useStegvisningNavigation(paths.uventetFeil)

  React.useEffect(() => {
    logger('feilside', {
      feil: 'Uventet feil',
    })
    window.scrollTo(0, 0)
  })

  return (
    <FrameComponent>
      <Card data-testid="error-page-unexpected" hasLargePadding>
        <Card.Content
          text={{
            header: 'error.global.title',
            ingress: 'error.global.ingress',
            primaryButton: 'error.global.button',
          }}
          onPrimaryButtonClick={onStegvisningCancel}
        />
      </Card>
    </FrameComponent>
  )
}
