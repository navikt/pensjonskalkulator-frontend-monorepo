import React from 'react'

import {
  ExpansionCard as ExpansionCardAksel,
  ExpansionCardProps,
} from '@navikt/ds-react'

import { logger } from '@/utils/logging'
interface IProps {
  name: string
  onClick?: () => void
  open?: boolean
}

const logIsOpen = (name: string, isOpen: boolean) => {
  if (isOpen) {
    logger('expansion card åpnet', { tekst: name })
  } else {
    logger('expansion card lukket', { tekst: name })
  }
}

export const ExpansionCard: React.FC<ExpansionCardProps & IProps> = ({
  name,
  children,
  open,
  onClick,
  ...rest
}) => {
  const toggleOpenReducer: React.ReducerWithoutAction<boolean> = (
    prevIsOpen
  ) => {
    const nextIsOpen = !prevIsOpen
    logIsOpen(name, nextIsOpen)
    return nextIsOpen
  }

  const [isOpen, toggleOpen] = React.useReducer(toggleOpenReducer, false)

  const isControlled = React.useMemo(
    () => open !== undefined && !!onClick,
    [open, onClick]
  )

  const wrappedOnClick = React.useCallback(() => {
    // Inversert da det er en antagelse at onClick endrer state
    logIsOpen(name, !open as boolean)
    !!onClick && onClick()
  }, [onClick])

  return (
    <ExpansionCardAksel
      data-testid="expansioncard"
      open={isControlled ? open : isOpen}
      onClick={isControlled ? wrappedOnClick : toggleOpen}
      {...rest}
    >
      {children}
    </ExpansionCardAksel>
  )
}
