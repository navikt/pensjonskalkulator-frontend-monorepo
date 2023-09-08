import React from 'react'

import { ReadMore as ReadMoreAksel, ReadMoreProps } from '@navikt/ds-react'

import logger from '@/utils/logging'
interface IProps extends ReadMoreProps {
  name: string
  children: React.ReactNode | React.ReactFragment
  onClick?: () => void
  open?: boolean
}

const logIsOpen = (name: string, isOpen: boolean) => {
  if (isOpen) {
    logger('readmore åpnet', { tekst: name })
  } else {
    logger('readmore lukket', { tekst: name })
  }
}

export const ReadMore: React.FC<IProps> = ({
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Er definert siden man aldri vil kalle denne dersom isControlled er false
    logIsOpen(name, !open!)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Er definert siden man aldri vil kalle denne dersom isControlled er false
    onClick!()
  }, [onClick])

  return (
    <ReadMoreAksel
      data-testid="readmore"
      open={isControlled ? open : isOpen}
      onClick={isControlled ? wrappedOnClick : toggleOpen}
      {...rest}
    >
      {children}
    </ReadMoreAksel>
  )
}
