import React from 'react'

import { ReadMore as ReadMoreAksel, ReadMoreProps } from '@navikt/ds-react'

import { logger } from '@/utils/logging'

interface IProps extends ReadMoreProps {
  name: string
}

const logIsOpen = (name: string, isOpen: boolean) => {
  if (isOpen) {
    logger('les mer åpnet', { tittel: name })
    // TODO: fjern når amplitude er ikke i bruk lenger
    logger('readmore åpnet', { tekst: name })
  } else {
    logger('les mer lukket', { tittel: name })
    // TODO: fjern når amplitude er ikke i bruk lenger
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
