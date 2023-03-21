import React from 'react'
import clsx from 'clsx'

import frameStyles from '../Frame/Frame.module.scss'
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
      <Pensjonsberegning/>
    </main>
  )
}
