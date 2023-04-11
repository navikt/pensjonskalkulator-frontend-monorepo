import React from 'react'

import { Heading } from '@navikt/ds-react'

import styles from './Pensjonssimulering.module.scss'

export function Pensjonssimulering() {
  return (
    <section className={styles.pensjonssimulering}>
      <Heading size="medium" level="3">
        Når vil du ta ut alderspensjon?
      </Heading>
    </section>
  )
}
