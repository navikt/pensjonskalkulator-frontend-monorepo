/* c8 disable */
import { SanityAlert } from '@pensjonskalkulator-frontend-monorepo/sanity/SanityAlert'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { Alert, Link } from '@navikt/ds-react'

import { paths } from '@/router/constants'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectNedreAldersgrense,
  selectNormertPensjonsalder,
  selectSkalBeregneAfpKap19,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { formatUttaksalder, isAlderOverAnnenAlder } from '@/utils/alder'
import { ALERT_VIST } from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

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
  const navigate = useNavigate()
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
  }, [alternativ])

  const altGradertUttaksalder = alternativ?.gradertUttaksalder
  const altHeltUttaksalder = alternativ?.heltUttaksalder
  const altUttaksgrad = alternativ?.uttaksgrad

  if (withAFP) {
    const erKombinertUttak = Boolean(
      altGradertUttaksalder &&
      altHeltUttaksalder &&
      altUttaksgrad != null &&
      altUttaksgrad < (gradertUttaksperiode?.grad ?? 100) &&
      isAlderOverAnnenAlder(altHeltUttaksalder, uttaksalder)
    )
    const alertId = !alternativ
      ? 'beregning.vilkaarsproeving.medAFP.ikkeNokOpptjening'
      : erKombinertUttak
        ? 'beregning.vilkaarsproeving.medAFP.heltOgGradertUttak'
        : 'beregning.vilkaarsproeving.medAFP.gradertUttak'

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
      <Alert variant="warning" role="alert">
        <FormattedMessage
          id="beregning.avansert.alert.vilkaarsproevning.afp_inntekt_maaned_foer_uttak"
          values={{
            ...getFormatMessageValues(),
            vilkaarForUttakAvAfp: (
              <Link
                href="https://www.nav.no/afp-offentlig#hvem-kan-fa"
                target="_blank"
                rel="noopener noreferrer"
                inlineText
              >
                <FormattedMessage id="Om vilkår for uttak av AFP" />
                <ExternalLinkIcon
                  title={intl.formatMessage({
                    id: 'application.global.external_link',
                  })}
                  width="1.25rem"
                  height="1.25rem"
                />
              </Link>
            ),
            alderspensjonUtenAFP: (
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  dispatch(userInputActions.setAfpInntektMaanedFoerUttak(null))
                  dispatch(
                    userInputActions.setCurrentSimulationGradertUttaksperiode(
                      null
                    )
                  )
                  dispatch(
                    userInputActions.setCurrentSimulationUttaksalder(null)
                  )
                  // TODO: fjern når amplitude er ikke i bruk lenger
                  logger('button klikk', { tekst: 'Grunnlag AFP: Gå til AFP' })
                  logger('knapp klikket', {
                    tekst: 'Grunnlag AFP: Gå til AFP',
                  })
                  navigate(paths.afp)
                }}
              >
                {intl.formatMessage({
                  id: 'beregning.avansert.alert.afp_inntekt_maaned_foer_uttak.link.text',
                })}
              </Link>
            ),
          }}
        />
      </Alert>
    )
  }

  const alternativAlder = altGradertUttaksalder || altHeltUttaksalder
  const erKombinertUttak =
    !isHeltUttaksalderLik &&
    Boolean(altGradertUttaksalder && altHeltUttaksalder)

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
    <Alert variant="warning" role="alert">
      <FormattedMessage id="beregning.vilkaarsproeving.intro" />
      <FormattedMessage
        id="beregning.vilkaarsproeving.intro.optional"
        values={getFormatMessageValues()}
      />
    </Alert>
  )
}

export default VilkaarsproevingAlert
