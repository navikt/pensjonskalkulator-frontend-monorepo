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

// TODO PEK-97 skrive tester logikk ref
export const GrunnlagSection = React.forwardRef(
  (
    { headerTitle, headerValue, isLoading, children }: Props,
    ref: React.ForwardedRef<HTMLSpanElement>
  ) => {
    const forwardedRef = ref

    const { ref: accordionContextRef, toggleOpen } =
      React.useContext(AccordionContext)
    const renderedValue = isLoading ? (
      <Loader data-testid={`${headerTitle}-loader`} />
    ) : (
      headerValue
    )
    return (
      <>
        <Accordion.Header data-testid="accordion-header" onClick={toggleOpen}>
          <span ref={forwardedRef ?? accordionContextRef}>{headerTitle}</span>
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
)
