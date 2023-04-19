import React from 'react'

import { Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import frameStyles from '../../scss/Frame/Frame.module.scss'
import whiteSectionStyles from '../../scss/WhiteSection/WhiteSection.module.scss'
import { Pensjonssimulering } from '../Pensjonssimulering'
import { TidligstMuligeUttak } from '../TidligstMuligeUttak'

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
        <Pensjonssimulering />
      </section>
    </main>
  )
}
