import React from 'react'

import {
  ExpansionCard as ExpansionCardAksel,
  ExpansionCardProps,
} from '@navikt/ds-react'

import { logger } from '@/utils/logging'

interface IProps {
  name: string
}

const logIsOpen = (name: string, isOpen: boolean) => {
  if (isOpen) {
    logger.custom('expansion card åpnet', { tekst: name })
  } else {
    logger.custom('expansion card lukket', { tekst: name })
  }
}

export const ExpansionCard: React.FC<ExpansionCardProps & IProps> = ({
  name,
  children,
  onToggle,
  ...rest
}) => (
  <ExpansionCardAksel
    onToggle={(newIsOpen) => {
      logIsOpen(name, newIsOpen)
      onToggle?.(newIsOpen)
    }}
    {...rest}
  >
    {children}
  </ExpansionCardAksel>
)
