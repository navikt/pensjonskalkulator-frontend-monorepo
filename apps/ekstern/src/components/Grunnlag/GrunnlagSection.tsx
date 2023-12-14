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

export const GrunnlagSection = ({
  headerTitle,
  headerValue,
  isLoading,
  children,
}: Props) => {
  const { toggleOpen } = React.useContext(AccordionContext)

  return (
    <>
      <Accordion.Header data-testid="accordion-header" onClick={toggleOpen}>
        <span data-testid="accordion-ref">{headerTitle}</span>
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
