import { compareAsc, parse } from 'date-fns'
import { useMemo } from 'react'

import { useAppSelector } from '@/state/hooks'
import {
  selectHarUtenlandsopphold,
  selectIsEndring,
} from '@/state/userInput/selectors'

export const useOppholdUtenforNorge = ({
  harForLiteTrygdetid,
}: {
  harForLiteTrygdetid?: boolean
}) => {
  const harUtenlandsopphold = useAppSelector(selectHarUtenlandsopphold)
  const isEndring = useAppSelector(selectIsEndring)
  return useMemo(():
    | 'mindre_enn_5_aar'
    | 'mer_enn_5_aar'
    | 'for_lite_trygdetid'
    | 'endring' => {
    if (isEndring) {
      return 'endring'
    }
    if (harForLiteTrygdetid) {
      return 'for_lite_trygdetid'
    }
    return harUtenlandsopphold ? 'mer_enn_5_aar' : 'mindre_enn_5_aar'
  }, [isEndring, harForLiteTrygdetid, harUtenlandsopphold])
}

export const useSortedUtenlandsperioder = (
  utenlandsperioder: Utenlandsperiode[]
) => {
  return useMemo(() => {
    return [...utenlandsperioder].sort((a, b) => {
      // If a has no sluttdato and b has, a comes first
      if (!a.sluttdato) return -1
      if (!b.sluttdato) return 1

      // If both have sluttdato, compare them
      const dateA = parse(a.sluttdato, 'dd.MM.yyyy', new Date())
      const dateB = parse(b.sluttdato, 'dd.MM.yyyy', new Date())

      return compareAsc(dateB, dateA)
    })
  }, [utenlandsperioder])
}
