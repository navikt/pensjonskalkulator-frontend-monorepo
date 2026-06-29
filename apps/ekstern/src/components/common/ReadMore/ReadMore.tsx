import React from 'react'

import { ReadMore as ReadMoreAksel, ReadMoreProps } from '@navikt/ds-react'
import { Events } from '@navikt/nav-dekoratoren-moduler'

import { logger } from '@/utils/logging'

interface IProps extends ReadMoreProps {
  name: string
}

const logIsOpen = (name: string, isOpen: boolean) => {
  if (isOpen) {
    logger(Events.LES_MER_APNET, { tittel: name })
    // TODO: fjern når amplitude er ikke i bruk lenger
    logger.custom('readmore åpnet', { tekst: name })
  } else {
    logger(Events.LES_MER_LUKKET, { tittel: name })
    // TODO: fjern når amplitude er ikke i bruk lenger
    logger.custom('readmore lukket', { tekst: name })
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
