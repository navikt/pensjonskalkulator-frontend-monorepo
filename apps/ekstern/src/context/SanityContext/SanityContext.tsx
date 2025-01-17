import React from 'react'

import { SanityForbeholdAvsnitt, SanityReadMore } from './SanityTypes'

interface SanityContext {
  // TODO få riktig type: https://www.sanity.io/plugins/sanity-typed-types
  readMoreData: SanityReadMore[]
  forbeholdAvsnittData: SanityForbeholdAvsnitt[]
}

export const SanityContext = React.createContext<SanityContext>({
  readMoreData: [],
  forbeholdAvsnittData: [],
})
