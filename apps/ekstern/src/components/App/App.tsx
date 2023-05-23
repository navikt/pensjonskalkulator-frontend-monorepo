import React from 'react'
import { useIntl } from 'react-intl'

import { Heading } from '@navikt/ds-react'

import { Pensjonsberegning } from '@/containers/Pensjonsberegning'

import styles from './App.module.scss'

export function App() {
  const intl = useIntl()

  return (
    <main className={styles.main}>
      <div className={styles.headerGroup}>
        <Heading size="large" level="1" spacing>
          {intl.formatMessage({ id: 'forside.title' })}
        </Heading>
      </div>
      <Pensjonsberegning />
    </main>
  )
}
