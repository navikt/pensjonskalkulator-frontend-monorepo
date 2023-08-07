import { FormattedMessage } from 'react-intl'

import { BodyLong, Button, Heading } from '@navikt/ds-react'

import { PageFramework } from '@/components/components/PageFramework'
import { ResponsiveCard } from '@/components/components/ResponsiveCard'
import { externalsUrls } from '@/routes'

import styles from './ErrorPageUnexpected.module.scss'

export function ErrorPageUnexpected() {
  return (
    <PageFramework>
      <ResponsiveCard data-testid="error-page-unexpected" hasLargePadding>
        {
          // TODO PEK-90 - avklaring rundt font-size for tittel
        }
        <Heading size="large" level="2" spacing>
          <FormattedMessage id="errorpage.unexpected.title" />
        </Heading>
        <BodyLong spacing>
          <FormattedMessage id="errorpage.unexpected.ingress" />
        </BodyLong>

        <Button
          className={`${styles.button} ${styles.buttonFirst}`}
          onClick={() => {
            window.location.reload()
          }}
        >
          <FormattedMessage id="errorpage.unexpected.button_1" />
        </Button>
        <Button
          className={`${styles.button} ${styles.buttonSecond}`}
          variant="secondary"
          onClick={() => {
            window.location.href = externalsUrls.dinPensjon
          }}
        >
          <FormattedMessage id="errorpage.unexpected.button_2" />
        </Button>
      </ResponsiveCard>
    </PageFramework>
  )
}
