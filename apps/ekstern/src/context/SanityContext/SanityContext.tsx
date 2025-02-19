import React from 'react'

import { SanityForbeholdAvsnitt, SanityReadMore } from './SanityTypes'

interface SanityContext {
  // TODO forbedringsmulighet: få generert akkurat riktig type: https://www.sanity.io/docs/sanity-typegen (eventuelt https://www.sanity.io/plugins/sanity-typed-types)
  readMoreData: SanityReadMore[]
  forbeholdAvsnittData: SanityForbeholdAvsnitt[]
}

export const SanityContext = React.createContext<SanityContext>({
  readMoreData: [],
  forbeholdAvsnittData: [],
})
