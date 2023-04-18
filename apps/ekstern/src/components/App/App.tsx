import React from 'react'

import { Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import frameStyles from '../../scss/Frame/Frame.module.scss'
import { Pensjonssimulering } from '../Pensjonssimulering'
import { Uttaksalternativer } from '../Uttaksalternativer'

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
      <Uttaksalternativer />
      <Pensjonssimulering />
    </main>
  )
}
