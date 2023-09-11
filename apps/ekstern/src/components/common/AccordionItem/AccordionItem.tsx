import React from 'react'

import { Accordion } from '@navikt/ds-react'

import { logger } from '@/utils/logging'

interface IProps {
  name: string
  initialOpen?: boolean
  children: React.ReactFragment
}

export const AccordionContext = React.createContext({
  isOpen: false,
  /* c8 ignore next 1 - Treffer aldri siden Aksel vil kaste feil dersom Accordion.Item ikke er i en Accordion */
  toggleOpen: () => console.warn('Context not initialized'),
})

export const AccordionItem: React.FC<IProps> = ({
  name,
  children,
  initialOpen = false,
}) => {
  const toggleOpenReducer: React.ReducerWithoutAction<boolean> = (
    prevState
  ) => {
    const newState = !prevState
    if (newState) {
      logger('accordion åpnet', {
        tekst: name,
      })
    } else {
      logger('accordion lukket', {
        tekst: name,
      })
    }

    return newState
  }
  const [isOpen, toggleOpen] = React.useReducer(toggleOpenReducer, initialOpen)

  return (
    <AccordionContext.Provider value={{ isOpen, toggleOpen }}>
      <Accordion.Item open={isOpen}>{children}</Accordion.Item>
    </AccordionContext.Provider>
  )
}
