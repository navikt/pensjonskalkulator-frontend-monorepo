import React, { PropsWithChildren } from 'react'
import { useIntl } from 'react-intl'

import { Heading } from '@navikt/ds-react'

import styles from './PageFramework.module.scss'

export function PageFramework({ children }: PropsWithChildren<unknown>) {
  const intl = useIntl()

  return (
    <main className={styles.main}>
      <div className={styles.headerGroup}>
        <Heading size="large" level="1" spacing>
          {intl.formatMessage({ id: 'forside.title' })}
        </Heading>
      </div>
      {children}
    </main>
  )
}
