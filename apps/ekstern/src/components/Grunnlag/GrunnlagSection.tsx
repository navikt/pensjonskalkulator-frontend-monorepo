import React from 'react'

import { Accordion, Loader } from '@navikt/ds-react'

import { AccordionContext } from '@/components/common/AccordionItem'

import styles from './GrunnlagSection.module.scss'

interface Props {
  headerTitle: string
  headerValue?: string
  isLoading?: boolean
  children: React.ReactNode
}

export const GrunnlagSection = React.forwardRef(
  (
    { headerTitle, headerValue, isLoading, children }: Props,
    ref: React.ForwardedRef<HTMLSpanElement>
  ) => {
    const forwardedRef = ref

    const { ref: accordionContextRef, toggleOpen } =
      React.useContext(AccordionContext)

    return (
      <>
        <Accordion.Header data-testid="accordion-header" onClick={toggleOpen}>
          <span
            ref={forwardedRef ?? accordionContextRef}
            data-testid="accordion-ref"
          >
            {headerTitle}
          </span>
          {isLoading ? (
            <>
              :{' '}
              <span className={styles.header}>
                <Loader data-testid={`${headerTitle}-loader`} />
              </span>
            </>
          ) : (
            <>
              : <span className={styles.header}>{headerValue}</span>
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
GrunnlagSection.displayName = 'GrunnlagSection'
