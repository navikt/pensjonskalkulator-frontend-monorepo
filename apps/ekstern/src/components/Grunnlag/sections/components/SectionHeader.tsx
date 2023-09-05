import { Loader } from '@navikt/ds-react'
import { Accordion } from '@navikt/ds-react'

import styles from './SectionHeader.module.scss'

interface Props {
  label: string
  isLoading?: boolean
  value?: string
}

export function SectionHeader({ label, isLoading, value }: Props) {
  const renderedValue = isLoading ? <Loader data-testid="loader" /> : value
  return (
    <Accordion.Header>
      {label}
      {renderedValue && (
        <>
          : <span className={styles.details}>{renderedValue}</span>
        </>
      )}
    </Accordion.Header>
  )
}
