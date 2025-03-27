import React from 'react'

import {
  SanityForbeholdAvsnitt,
  SanityGuidePanel,
  SanityReadMore,
} from './SanityTypes'

interface SanityContext {
  // TODO forbedringsmulighet: få generert akkurat riktig type: https://www.sanity.io/docs/sanity-typegen (eventuelt https://www.sanity.io/plugins/sanity-typed-types)
  guidePanelData: Record<string, SanityGuidePanel>
  readMoreData: Record<string, SanityReadMore>
  forbeholdAvsnittData: SanityForbeholdAvsnitt[]
}

export const SanityContext = React.createContext<SanityContext>({
  guidePanelData: {},
  readMoreData: {},
  forbeholdAvsnittData: [],
})
