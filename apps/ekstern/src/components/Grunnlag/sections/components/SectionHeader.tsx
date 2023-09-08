import React from 'react'

import { Loader } from '@navikt/ds-react'
import { Accordion } from '@navikt/ds-react'

import { AccordionContext } from '@/components/components/AccordionItem'

import styles from './SectionHeader.module.scss'

interface Props {
  label: string
  isLoading?: boolean
  value?: string
}

export function SectionHeader({ label, isLoading, value }: Props) {
  const { toggleOpen } = React.useContext(AccordionContext)
  const renderedValue = isLoading ? <Loader data-testid="loader" /> : value
  return (
    <Accordion.Header data-testid="accordion-header" onClick={toggleOpen}>
      {label}
      {renderedValue && (
        <>
          : <span className={styles.details}>{renderedValue}</span>
        </>
      )}
    </Accordion.Header>
  )
}
