import React from 'react'
import { useIntl } from 'react-intl'

import { useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectAfpUtregningValg,
  selectCurrentSimulation,
  selectFoedselsdato,
  selectIsEndring,
  selectLoependeVedtak,
  selectSamtykkeOffentligAFP,
  selectSkalBeregneAfpKap19,
  selectUfoeregrad,
} from '@/state/userInput/selectors'
import { formatAfp } from '@/utils/afp'
import {
  AFP_UFOERE_OPPSIGELSESALDER,
  isFoedselsdatoOverAlder,
  isFoedtFoer1963,
} from '@/utils/alder'

export const useFormatertAfpHeader = () => {
  const intl = useIntl()

  const afp = useAppSelector(selectAfp) ?? 'vet_ikke'
  const skalBeregneAfpKap19 = useAppSelector(selectSkalBeregneAfpKap19)
  const afpUtregningValg = useAppSelector(selectAfpUtregningValg)
  const foedselsdato = useAppSelector(selectFoedselsdato)
  const samtykkeOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const isEndring = useAppSelector(selectIsEndring)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
  const ufoeregrad = useAppSelector(selectUfoeregrad)
  const { beregningsvalg } = useAppSelector(selectCurrentSimulation)

  const hasAFP = afp === 'ja_offentlig' || afp === 'ja_privat'
  const hasOffentligAFP = afp === 'ja_offentlig'
  const isUfoerAndDontWantAfp = !!ufoeregrad && beregningsvalg !== 'med_afp'

  const formatertAfpHeader = React.useMemo(() => {
    const afpString = formatAfp(intl, afp ?? 'vet_ikke')

    if (afpUtregningValg === 'KUN_ALDERSPENSJON') {
      return formatAfp(intl, 'nei')
    }

    if (
      loependeVedtak &&
      loependeVedtak.pre2025OffentligAfp &&
      foedselsdato &&
      isFoedtFoer1963(foedselsdato)
    ) {
      return formatAfp(intl, 'ja_offentlig')
    }

    if (isEndring && loependeVedtak.afpPrivat) {
      return `${formatAfp(intl, 'ja_privat')} (${intl.formatMessage({ id: 'grunnlag.afp.endring' })})`
    }

    if (loependeVedtak && loependeVedtak.afpOffentlig) {
      return `${formatAfp(intl, 'ja_offentlig')} (${intl.formatMessage({ id: 'grunnlag.afp.endring' })})`
    }

    if (
      !skalBeregneAfpKap19 &&
      ((hasAFP && isUfoerAndDontWantAfp) ||
        (hasOffentligAFP && !samtykkeOffentligAFP && !isUfoerAndDontWantAfp))
    ) {
      return `${afpString} (${intl.formatMessage({ id: 'grunnlag.afp.ikke_beregnet' })})`
    }

    if (
      ufoeregrad === 100 ||
      (ufoeregrad > 0 && foedselsdato && isFoedtFoer1963(foedselsdato)) ||
      (ufoeregrad > 0 &&
        foedselsdato &&
        !isFoedtFoer1963(foedselsdato) &&
        isFoedselsdatoOverAlder(foedselsdato, AFP_UFOERE_OPPSIGELSESALDER))
    ) {
      return formatAfp(intl, 'nei')
    }

    return afpString
  }, [
    afp,
    hasAFP,
    hasOffentligAFP,
    samtykkeOffentligAFP,
    isEndring,
    isUfoerAndDontWantAfp,
    intl,
    loependeVedtak,
    ufoeregrad,
    afpUtregningValg,
    foedselsdato,
    skalBeregneAfpKap19,
  ])

  return formatertAfpHeader
}
