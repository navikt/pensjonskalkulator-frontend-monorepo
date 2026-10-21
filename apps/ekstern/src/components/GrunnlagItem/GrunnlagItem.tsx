import clsx from 'clsx'
import React, { ReactNode } from 'react'

import { Box } from '@navikt/ds-react'

import styles from './GrunnlagItem.module.scss'

export interface GrunnlagItemProps {
  children: ReactNode
  color: 'purple' | 'blue' | 'green' | 'gray'
}

export const GrunnlagItem: React.FC<GrunnlagItemProps> = ({
  children,
  color,
}) => {
  return (
    <Box
      paddingInline="space-16 space-0"
      className={clsx(styles.border, styles[color], styles.grunnlagItem)}
    >
      <Box paddingBlock="space-16">{children}</Box>
    </Box>
  )
}
