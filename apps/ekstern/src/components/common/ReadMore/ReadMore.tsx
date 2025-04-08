import React from 'react'

import { ReadMore as ReadMoreAksel, ReadMoreProps } from '@navikt/ds-react'

import { logger } from '@/utils/logging'

interface IProps extends ReadMoreProps {
  name: string
}

const logIsOpen = (name: string, isOpen: boolean) => {
  if (isOpen) {
    logger('readmore åpnet', { tekst: name })
  } else {
    logger('readmore lukket', { tekst: name })
  }
}

export const ReadMore: React.FC<IProps> = ({ name, onOpenChange, ...rest }) => (
  <ReadMoreAksel
    data-testid="readmore"
    onOpenChange={(open) => {
      logIsOpen(name, open)
      onOpenChange?.(open)
    }}
    {...rest}
  />
)
