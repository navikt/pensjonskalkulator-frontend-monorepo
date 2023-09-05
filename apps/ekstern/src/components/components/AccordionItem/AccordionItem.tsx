import React from 'react'

import { Accordion } from '@navikt/ds-react'

import logger from '@/utils/logging'

interface IProps {
  name: string
  initialOpen?: boolean
  children: React.ReactFragment
}

export const AccordionContext = React.createContext({
  isOpen: false,
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
    if (prevState) {
      logger('accordion lukket', {
        tekst: name,
      })
      return false
    } else {
      logger('accordion åpnet', {
        tekst: name,
      })
      return true
    }
  }

  const [isOpen, toggleOpen] = React.useReducer(toggleOpenReducer, initialOpen)

  return (
    <AccordionContext.Provider value={{ isOpen, toggleOpen }}>
      <Accordion.Item open={isOpen}>{children}</Accordion.Item>
    </AccordionContext.Provider>
  )
}
