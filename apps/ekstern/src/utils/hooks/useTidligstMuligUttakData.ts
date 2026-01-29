import { useEffect, useMemo, useState } from 'react'

import {
  useGetAfpOffentligLivsvarigQuery,
  useGetPersonQuery,
  useTidligstMuligHeltUttakQuery,
} from '@/state/api/apiSlice'
import { generateTidligstMuligHeltUttakRequestBody } from '@/state/api/utils'
import { useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttakBeloep,
  selectAfp,
  selectEpsHarInntektOver2G,
  selectEpsHarPensjon,
  selectFoedselsdato,
  selectLoependeVedtak,
  selectNedreAldersgrense,
  selectNormertPensjonsalder,
  selectSamtykkeOffentligAFP,
  selectSivilstand,
  selectUtenlandsperioder,
} from '@/state/userInput/selectors'
import {
  isAlder75MaanedenFylt,
  isAlderOver62,
  isFoedtFoer1964,
} from '@/utils/alder'

/**
 * Custom hook for pension-related calculations and conditions
 * @returns Common pension calculation values
 */
export const useTidligstMuligUttakConditions = () => {
  const { isSuccess: isPersonSuccess, data: person } = useGetPersonQuery()
  const afp = useAppSelector(selectAfp)
  const samtykkeOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)

  const nedreAldersgrense = useAppSelector(selectNedreAldersgrense)
  const normertPensjonsalder = useAppSelector(selectNormertPensjonsalder)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
  const hasAFP =
    (afp === 'ja_offentlig' && samtykkeOffentligAFP) || afp === 'ja_privat'
  const isOver75AndNoLoependeVedtak =
    !loependeVedtak?.harLoependeVedtak &&
    !!person?.foedselsdato &&
    isAlder75MaanedenFylt(person.foedselsdato)

  const show1963Text = useMemo(() => {
    return isPersonSuccess && isFoedtFoer1964(person?.foedselsdato)
  }, [isPersonSuccess, person?.foedselsdato])

  const loependeVedtakPre2025OffentligAfp = Boolean(
    loependeVedtak?.pre2025OffentligAfp
  )
  return {
    normertPensjonsalder,
    nedreAldersgrense,
    isOver75AndNoLoependeVedtak,
    show1963Text,
    loependeVedtakPre2025OffentligAfp,
    loependeVedtak,
    person,
    isPersonSuccess,
    hasAFP,
  }
}

/**
 * Custom hook for fetching tidligst mulig uttak data with automatic request body generation
 * @param ufoeregrad Optional ufoeregrad parameter
 * @returns The data from the API call, loading state, and success state
 */
export const useTidligstMuligUttak = (ufoeregrad?: number) => {
  const afp = useAppSelector(selectAfp)
  const sivilstand = useAppSelector(selectSivilstand)
  const harSamtykketOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const epsHarPensjon = useAppSelector(selectEpsHarPensjon)
  const epsHarInntektOver2G = useAppSelector(selectEpsHarInntektOver2G)
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
  const utenlandsperioder = useAppSelector(selectUtenlandsperioder)
  const foedselsdato = useAppSelector(selectFoedselsdato)
  const {
    isSuccess: isAfpOffentligLivsvarigSuccess,
    data: loependeLivsvarigAfpOffentlig,
  } = useGetAfpOffentligLivsvarigQuery(undefined, {
    skip:
      !harSamtykketOffentligAFP ||
      !foedselsdato ||
      !isAlderOver62(foedselsdato),
  })
  const [
    tidligstMuligHeltUttakRequestBody,
    setTidligstMuligHeltUttakRequestBody,
  ] = useState<TidligstMuligHeltUttakRequestBody | undefined>(undefined)

  // Generate request body when dependencies change
  useEffect(() => {
    if (!ufoeregrad && loependeVedtak && !loependeVedtak?.pre2025OffentligAfp) {
      const requestBody = generateTidligstMuligHeltUttakRequestBody({
        loependeVedtak,
        afp: afp === 'ja_offentlig' && !harSamtykketOffentligAFP ? null : afp,
        sivilstand: sivilstand,
        epsHarPensjon,
        epsHarInntektOver2G,
        aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
        utenlandsperioder,
        loependeLivsvarigAfpOffentlig: isAfpOffentligLivsvarigSuccess
          ? loependeLivsvarigAfpOffentlig
          : null,
      })
      setTidligstMuligHeltUttakRequestBody(requestBody)
    } else {
      setTidligstMuligHeltUttakRequestBody(undefined)
    }
  }, [
    ufoeregrad,
    loependeVedtak,
    afp,
    harSamtykketOffentligAFP,
    sivilstand,
    epsHarPensjon,
    epsHarInntektOver2G,
    aarligInntektFoerUttakBeloep,
    utenlandsperioder,
  ])

  // Make API call
  const {
    data: tidligstMuligUttak,
    isLoading: isTidligstMuligUttakLoading,
    isSuccess: isTidligstMuligUttakSuccess,
    ...rest
  } = useTidligstMuligHeltUttakQuery(tidligstMuligHeltUttakRequestBody, {
    skip:
      !tidligstMuligHeltUttakRequestBody ||
      Boolean(ufoeregrad) ||
      Boolean(loependeVedtak?.pre2025OffentligAfp),
  })

  return {
    data: tidligstMuligUttak,
    isLoading: isTidligstMuligUttakLoading,
    isSuccess: isTidligstMuligUttakSuccess,
    requestBody: tidligstMuligHeltUttakRequestBody,
    setRequestBody: setTidligstMuligHeltUttakRequestBody,
    ...rest,
  }
}
