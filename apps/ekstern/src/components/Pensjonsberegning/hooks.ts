import { useMemo } from 'react'

import { generateAlderArray, formatUttaksalder } from './utils'

export const useAlderChips = (data?: Uttaksalder, maksalder = 77): string[] =>
  useMemo(
    () =>
      data?.aar
        ? generateAlderArray(
            data.aar,
            maksalder,
            formatUttaksalder(data, { compact: true })
          )
        : [],
    [data]
  )
