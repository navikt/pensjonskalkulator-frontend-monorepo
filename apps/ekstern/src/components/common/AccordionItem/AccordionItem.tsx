import React from 'react'

import { Accordion } from '@navikt/ds-react'

import { logger } from '@/utils/logging'

interface IProps {
  name: string
  initialOpen?: boolean
  onClick?: () => void // kun hvis controlled
  isOpen?: boolean // kun hvis controlled
  children: React.JSX.Element
}

interface AccordionContextType {
  ref?: React.RefObject<HTMLSpanElement>
  isOpen: boolean
  toggleOpen: () => void
}

export const AccordionContext = React.createContext<AccordionContextType>({
  ref: undefined,
  isOpen: false,
  /* c8 ignore next 5 - Treffer aldri siden Aksel vil kaste feil dersom Accordion.Item ikke er i en Accordion */
  toggleOpen: () => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('AccordionContext not initialized')
    }
  },
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
  isOpen: isOpenFromProps,
  onClick,
}) => {
  const isControlled = React.useMemo(
    () => isOpenFromProps !== undefined && !!onClick,
    [isOpenFromProps, onClick]
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
    logIsOpen(name, !isOpenFromProps)
    if (onClick) {
      onClick()
    }
  }, [onClick])

  return (
    <AccordionContext.Provider
      value={{ isOpen, toggleOpen: isControlled ? wrappedOnClick : toggleOpen }}
    >
      <Accordion.Item open={isControlled ? isOpenFromProps : isOpen}>
        {children}
      </Accordion.Item>
    </AccordionContext.Provider>
  )
}
