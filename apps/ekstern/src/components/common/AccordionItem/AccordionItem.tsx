import React from 'react'

import { Accordion } from '@navikt/ds-react'

import { logger } from '@/utils/logging'

interface IProps {
  name: string
  initialOpen?: boolean
  onClick?: () => void // kun hvis controlled
  open?: boolean // kun hvis controlled
  children: React.ReactFragment | JSX.Element
}

interface AccordionContextType {
  ref?: React.RefObject<HTMLSpanElement>
  isOpen: boolean
  toggleOpen: () => void
}

export const AccordionContext = React.createContext<AccordionContextType>({
  ref: undefined,
  isOpen: false,
  /* c8 ignore next 1 - Treffer aldri siden Aksel vil kaste feil dersom Accordion.Item ikke er i en Accordion */
  toggleOpen: () => console.warn('Context not initialized'),
})

const logIsOpen = (name: string, isOpen: boolean) => {
  if (isOpen) {
    logger('accordion åpnet', { tekst: name })
  } else {
    logger('accordion lukket', { tekst: name })
  }
}

export const AccordionItem: React.FC<IProps> = ({
  name,
  children,
  initialOpen = false,
  open,
  onClick,
}) => {
  const isControlled = React.useMemo(
    () => open !== undefined && !!onClick,
    [open, onClick]
  )

  const toggleOpenReducer: React.ReducerWithoutAction<boolean> = (
    prevIsOpen
  ) => {
    const nextIsOpen = !prevIsOpen
    logIsOpen(name, nextIsOpen)
    return nextIsOpen
  }

  const [isOpen, toggleOpen] = React.useReducer(toggleOpenReducer, initialOpen)

  const wrappedOnClick = React.useCallback(() => {
    // Inversert da det er en antagelse at onClick endrer state
    logIsOpen(name, !open as boolean)
    !!onClick && onClick()
  }, [onClick])

  return (
    <AccordionContext.Provider
      value={{ isOpen, toggleOpen: isControlled ? wrappedOnClick : toggleOpen }}
    >
      <Accordion.Item open={isControlled ? open : isOpen}>
        {children}
      </Accordion.Item>
    </AccordionContext.Provider>
  )
}
