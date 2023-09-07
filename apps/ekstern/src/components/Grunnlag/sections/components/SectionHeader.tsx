import React from 'react'

import { Accordion } from '@navikt/ds-react'

import { AccordionContext } from '@/components/components/AccordionItem'

import styles from './SectionHeader.module.scss'

interface Props {
  label: string
  value?: string
}

export function SectionHeader({ label, value }: Props) {
  const { toggleOpen } = React.useContext(AccordionContext)
  return (
    <Accordion.Header data-testid="accordion-header" onClick={toggleOpen}>
      {label}
      {value && (
        <>
          : <span className={styles.details}>{value}</span>
        </>
      )}
    </Accordion.Header>
  )
}
