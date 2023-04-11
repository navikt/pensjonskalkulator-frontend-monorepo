import React from 'react'

import { Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import frameStyles from '../../scss/Frame/Frame.module.scss'
import { Pensjonsberegning } from '../Pensjonsberegning'

import styles from './App.module.scss'

export function App() {
  return (
    <main
      className={clsx(
        frameStyles.frame,
        frameStyles.frame_isFlex,
        frameStyles.frame_hasPadding,
        styles.main
      )}
    >
      <Heading size="large" level="1" spacing>
        Pensjonskalkulator
      </Heading>
      <Heading size="medium" level="2" spacing>
        Din beregning
      </Heading>
      <Pensjonsberegning />
    </main>
  )
}
