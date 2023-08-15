import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Button, Heading, List } from '@navikt/ds-react'

import { PageFramework } from '@/components/components/PageFramework'
import { ResponsiveCard } from '@/components/components/ResponsiveCard'
import { externalUrls } from '@/routes'

import styles from './ErrorPage404.module.scss'

export function ErrorPage404() {
  const navigate = useNavigate()

  return (
    <PageFramework>
      <ResponsiveCard data-testid="error-page-404" hasLargePadding>
        {
          // TODO PEK-89 - avklaring rundt font-size for tittel
        }
        <Heading size="large" level="2" spacing>
          <FormattedMessage id="errorpage.404.title" />
        </Heading>
        <List>
          <List.Item>
            <FormattedMessage id="errorpage.404.list_item1" />
          </List.Item>
          <List.Item>
            <FormattedMessage id="errorpage.404.list_item2" />
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
