import { FormattedMessage } from 'react-intl'

import { BodyLong, Button, Heading } from '@navikt/ds-react'

import { Card } from '@/components/components/Card'
import { PageFramework } from '@/components/components/PageFramework'
import { externalUrls } from '@/routes'

import styles from './ErrorPageUnexpected.module.scss'

export function ErrorPageUnexpected() {
  return (
    <PageFramework>
      <Card data-testid="error-page-unexpected" hasLargePadding>
        <Heading level="2" size="medium" spacing>
          <FormattedMessage id="error.global.title" />
        </Heading>
        <BodyLong spacing>
          <FormattedMessage id="error.global.ingress" />
        </BodyLong>

        <Button
          className={`${styles.button} ${styles.buttonFirst}`}
          onClick={() => {
            window.location.reload()
          }}
        >
          <FormattedMessage id="error.global.button.primary" />
        </Button>
        <Button
          className={`${styles.button} ${styles.buttonSecond}`}
          variant="secondary"
          onClick={() => {
            window.location.href = externalUrls.dinPensjon
          }}
        >
          <FormattedMessage id="error.global.button.secondary" />
        </Button>
      </Card>
    </PageFramework>
  )
}
