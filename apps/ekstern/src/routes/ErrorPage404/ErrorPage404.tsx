import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { BodyLong, Button, Heading, List } from '@navikt/ds-react'

import { Card } from '@/components/components/Card'
import { PageFramework } from '@/components/components/PageFramework'
import { externalUrls } from '@/routes'

import styles from './ErrorPage404.module.scss'

export function ErrorPage404() {
  const navigate = useNavigate()

  return (
    <PageFramework>
      <Card data-testid="error-page-404" hasLargePadding>
        <Heading level="2" size="medium" spacing>
          <FormattedMessage id="errorpage.404.title" />
        </Heading>
        <List>
          <List.Item>
            <BodyLong>
              <FormattedMessage id="errorpage.404.list_item1" />
            </BodyLong>
          </List.Item>
          <List.Item>
            <BodyLong>
              <FormattedMessage id="errorpage.404.list_item2" />
            </BodyLong>
          </List.Item>
        </List>

        <Button
          className={styles.button}
          onClick={() => {
            navigate(-1)
          }}
        >
          <FormattedMessage id="errorpage.404.button.primary" />
        </Button>
        <Button
          className={styles.button}
          variant="secondary"
          onClick={() => {
            window.location.href = externalUrls.dinPensjon
          }}
        >
          <FormattedMessage id="errorpage.404.button.secondary" />
        </Button>
      </Card>
    </PageFramework>
  )
}
