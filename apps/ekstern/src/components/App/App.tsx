import React from 'react'

import { Heading } from '@navikt/ds-react'

import { TidligstMuligeUttak } from '@/components/TidligstMuligeUttak'

import styles from './App.module.scss'

export function App() {
  return (
    <main className={styles.main}>
      <div className={styles.headerGroup}>
        <Heading size="large" level="1" spacing>
          Pensjonskalkulator
        </Heading>
      </div>
      <TidligstMuligeUttak />
    </main>
  )
}
