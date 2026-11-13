/* c8 disable */
import { SanityAlert } from '@pensjonskalkulator-frontend-monorepo/sanity/SanityAlert'
import React from 'react'
import { useIntl } from 'react-intl'

import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectNedreAldersgrense,
  selectNormertPensjonsalder,
  selectSkalBeregneAfpKap19,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { formatUttaksalder } from '@/utils/alder'
import { ALERT_VIST } from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'

export interface Props {
  alternativ: Vilkaarsproeving['alternativ']
  uttaksalder: Alder
  withAFP?: boolean
}

export const VilkaarsproevingAlert = ({
  alternativ,
  uttaksalder,
  withAFP = false,
}: Props) => {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const { gradertUttaksperiode } = useAppSelector(selectCurrentSimulation)
  const nedreAldersgrense = useAppSelector(selectNedreAldersgrense)
  const normertPensjoneringsalder = useAppSelector(selectNormertPensjonsalder)
  const skalBeregneAfpKap19 = useAppSelector(selectSkalBeregneAfpKap19)
  const dynamicPensjonsaldre = {
    ...(nedreAldersgrense && {
      nedreAldersgrense: formatUttaksalder(intl, nedreAldersgrense),
    }),
    ...(normertPensjoneringsalder && {
      normertPensjoneringsalder: formatUttaksalder(
        intl,
        normertPensjoneringsalder
      ),
    }),
  }

  const isHeltUttaksalderLik = React.useMemo(() => {
    return (
      JSON.stringify(alternativ?.heltUttaksalder) ===
      JSON.stringify(uttaksalder)
    )
  }, [alternativ, uttaksalder])

  const altGradertUttaksalder = alternativ?.gradertUttaksalder
  const altHeltUttaksalder = alternativ?.heltUttaksalder
  const altUttaksgrad = alternativ?.uttaksgrad
  const erKombinertUttak =
    !isHeltUttaksalderLik &&
    Boolean(altGradertUttaksalder && altHeltUttaksalder)

  if (withAFP) {
    const getAlertId = () => {
      if (!alternativ) {
        return 'beregning.vilkaarsproeving.ikke_nok_opptjening_nedre_alder.ut_afp'
      }

      if (erKombinertUttak && gradertUttaksperiode) {
        return 'beregning.vilkaarsproeving.ikke_nok_opptjening.ut_afp'
      }

      return 'beregning.vilkaarsproeving.ikke_nok_opptjening_gradert.ut_afp'
    }

    const alertId = getAlertId()

    logger(ALERT_VIST, {
      tekst: alertId,
      variant: 'warning',
    })

    return (
      <SanityAlert
        id={alertId}
        role="alert"
        dynamicValues={{
          ...dynamicPensjonsaldre,
          ...(altUttaksgrad != null && { grad_gradert: altUttaksgrad }),
          ...(altHeltUttaksalder && {
            helt_alder: formatUttaksalder(intl, altHeltUttaksalder),
          }),
        }}
      />
    )
  }

  if (skalBeregneAfpKap19) {
    return (
      <SanityAlert
        id="afp.vilkaarsproeving.vilkaar-ikke-oppfylt.ekstern"
        role="alert"
        onRouteClick={() => {
          dispatch(userInputActions.setAfpInntektMaanedFoerUttak(null))
          dispatch(
            userInputActions.setCurrentSimulationGradertUttaksperiode(null)
          )
          dispatch(userInputActions.setCurrentSimulationUttaksalder(null))
          logger('knapp klikket', { tekst: 'Grunnlag AFP: Gå til AFP' })
        }}
      />
    )
  }

  const alternativAlder = altGradertUttaksalder || altHeltUttaksalder

  if (alternativAlder && altHeltUttaksalder) {
    return (
      <SanityAlert
        id={
          erKombinertUttak
            ? 'beregning.vilkaarsproeving.ikke_nok_opptjening_gradert'
            : 'beregning.vilkaarsproeving.ikke_nok_opptjening'
        }
        role="alert"
        dynamicValues={{
          ...dynamicPensjonsaldre,
          grad: altGradertUttaksalder ? (altUttaksgrad ?? 100) : 100,
          alder: formatUttaksalder(
            intl,
            erKombinertUttak ? altHeltUttaksalder : alternativAlder
          ),
          grad_gradert: altGradertUttaksalder ? (altUttaksgrad ?? 100) : 100,
          gradert_alder: formatUttaksalder(intl, alternativAlder),
          helt_alder: formatUttaksalder(intl, altHeltUttaksalder),
          nbsp: '\u00A0',
        }}
      />
    )
  }

  return (
    <SanityAlert
      id="beregning.vilkaarsproeving.ikke_nok_opptjening"
      role="alert"
      dynamicValues={dynamicPensjonsaldre}
    />
  )
}

export default VilkaarsproevingAlert
