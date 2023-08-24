import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { BodyLong, List } from '@navikt/ds-react'

import { Card } from '@/components/components/Card'
import { PageFramework } from '@/components/components/PageFramework'
import { externalUrls } from '@/routes'

export function ErrorPage404() {
  const navigate = useNavigate()

  const onPrevious = (): void => {
    navigate(-1)
  }

  const onCancel = (): void => {
    window.location.href = externalUrls.dinPensjon
  }

  return (
    <PageFramework>
      <Card data-testid="error-page-404" hasLargePadding>
        <Card.Content
          text={{
            header: 'error.404.title',
            primaryButton: 'error.404.button.primary',
            secondaryButton: 'error.404.button.secondary',
          }}
          onPrimaryButtonClick={onPrevious}
          onSecondaryButtonClick={onCancel}
        >
          <List>
            <List.Item>
              <BodyLong>
                <FormattedMessage id="error.404.list_item1" />
              </BodyLong>
            </List.Item>
            <List.Item>
              <BodyLong>
                <FormattedMessage id="error.404.list_item2" />
              </BodyLong>
            </List.Item>
          </List>
        </Card.Content>
      </Card>
    </PageFramework>
  )
}
