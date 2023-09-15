import React from 'react'

import { Loader } from '@navikt/ds-react'
import { Accordion } from '@navikt/ds-react'

import { AccordionContext } from '@/components/common/AccordionItem'

import styles from './GrunnlagSection.module.scss'

interface Props {
  headerTitle: string
  headerValue?: string
  isLoading?: boolean
  children: JSX.Element
}

export function GrunnlagSection({
  headerTitle,
  headerValue,
  isLoading,
  children,
}: Props) {
  const { toggleOpen } = React.useContext(AccordionContext)
  const renderedValue = isLoading ? (
    <Loader data-testid={`${headerTitle}-loader`} />
  ) : (
    headerValue
  )
  return (
    <>
      <Accordion.Header data-testid="accordion-header" onClick={toggleOpen}>
        {headerTitle}
        {renderedValue && (
          <>
            : <span className={styles.header}>{renderedValue}</span>
          </>
        )}
      </Accordion.Header>
      <Accordion.Content className={styles.content}>
        {children}
      </Accordion.Content>
    </>
  )
}
