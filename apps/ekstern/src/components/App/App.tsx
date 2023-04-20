import React from 'react'

import { Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import { Pensjonssimulering } from '@/components/Pensjonssimulering'
import { TidligstMuligeUttak } from '@/components/TidligstMuligeUttak'
import frameStyles from '@/scss/Frame/Frame.module.scss'
import whiteSectionStyles from '@/scss/WhiteSection/WhiteSection.module.scss'

import styles from './App.module.scss'

export function App() {
  return (
    <main
      className={clsx(frameStyles.frame, frameStyles.frame_isFlex, styles.main)}
    >
      <div className={styles.headerGroup}>
        <Heading size="large" level="1" spacing>
          Pensjonskalkulator
        </Heading>
      </div>
      <section
        className={clsx(whiteSectionStyles.whiteSection, styles.section)}
      >
        <TidligstMuligeUttak />
      </section>
    </main>
  )
}
