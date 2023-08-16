import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { BodyShort, Button, Heading, List } from '@navikt/ds-react'

import { PageFramework } from '@/components/components/PageFramework'
import { ResponsiveCard } from '@/components/components/ResponsiveCard'
import { externalUrls } from '@/routes'

import styles from './ErrorPage404.module.scss'

export function ErrorPage404() {
  const navigate = useNavigate()

  return (
    <PageFramework>
      <ResponsiveCard data-testid="error-page-404" hasLargePadding>
        <Heading size="medium" level="2" spacing>
          <FormattedMessage id="errorpage.404.title" />
        </Heading>
        <List>
          <List.Item>
            <BodyShort>
              <FormattedMessage id="errorpage.404.list_item1" />
            </BodyShort>
          </List.Item>
          <List.Item>
            <BodyShort>
              <FormattedMessage id="errorpage.404.list_item2" />
            </BodyShort>
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
      </ResponsiveCard>
    </PageFramework>
  )
}
