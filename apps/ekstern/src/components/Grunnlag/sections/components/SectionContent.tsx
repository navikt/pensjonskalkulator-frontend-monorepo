import React, { PropsWithChildren } from 'react'
import { Accordion } from '@navikt/ds-react'

import styles from './SectionContent.module.scss'

export const SectionContent: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Accordion.Content className={styles.content}>{children}</Accordion.Content>
  )
}
