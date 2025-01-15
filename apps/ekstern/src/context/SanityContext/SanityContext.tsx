import React from 'react'

import { SanityReadMore } from './SanityTypes'

interface SanityContext {
  // TODO få riktig type: https://www.sanity.io/plugins/sanity-typed-types
  readMoreData: SanityReadMore[]
}

export const SanityContext = React.createContext<SanityContext>({
  readMoreData: [],
})
