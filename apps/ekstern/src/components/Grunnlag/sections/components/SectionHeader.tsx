import React from 'react'

import { Accordion } from '@navikt/ds-react'

import styles from './SectionHeader.module.scss'

interface Props {
  label: string
  value?: string
}

export function SectionHeader({ label, value }: Props) {
  return (
    <Accordion.Header>
      {label}
      {value && (
        <>
          : <span className={styles.details}>{value}</span>
        </>
      )}
    </Accordion.Header>
  )
}
