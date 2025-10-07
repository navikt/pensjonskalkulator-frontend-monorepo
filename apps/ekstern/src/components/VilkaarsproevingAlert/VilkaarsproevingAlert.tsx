/* c8 disable */
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
import { formatUttaksalder } from '@/utils/alder'
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
  const normertPensjonsalder = useAppSelector(selectNormertPensjonsalder)
  const nedreAldersgrense = useAppSelector(selectNedreAldersgrense)
  const skalBeregneAfpKap19 = useAppSelector(selectSkalBeregneAfpKap19)

  const harIkkeNokOpptjening = React.useMemo(() => {
    return (
      JSON.stringify(alternativ?.heltUttaksalder) ===
        JSON.stringify(normertPensjonsalder) && !alternativ?.gradertUttaksalder
    )
  }, [alternativ])

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
    logger(ALERT_VIST, {
      tekst: 'Beregning med AFP',
      variant: 'warning',
    })

    return (
      <Alert variant="warning">
        {alternativ ? (
          <>
            <FormattedMessage id="beregning.vilkaarsproeving.medAFP.intro" />

            {isHeltUttaksalderLik && altGradertUttaksalder && (
              <FormattedMessage
                id="beregning.vilkaarsproeving.alternativer.medAFP.gradertUttak"
                values={{
                  ...getFormatMessageValues(),
                  alternativtGrad: altUttaksgrad,
                  nedreAldersgrense: formatUttaksalder(intl, nedreAldersgrense),
                }}
              />
            )}

            {!isHeltUttaksalderLik &&
              altGradertUttaksalder &&
              altHeltUttaksalder &&
              gradertUttaksperiode && (
                <FormattedMessage
                  id="beregning.vilkaarsproeving.alternativer.medAFP.heltOgGradertUttak"
                  values={{
                    ...getFormatMessageValues(),
                    alternativtGrad: altUttaksgrad,
                    alternativtHeltStartAar: altHeltUttaksalder.aar,
                    alternativtHeltStartMaaned: altHeltUttaksalder.maaneder,
                    nedreAldersgrense: formatUttaksalder(
                      intl,
                      nedreAldersgrense
                    ),
                  }}
                />
              )}

            {!isHeltUttaksalderLik &&
              altGradertUttaksalder &&
              !gradertUttaksperiode && (
                <FormattedMessage
                  id="beregning.vilkaarsproeving.alternativer.medAFP.heltOgGradertUttak100"
                  values={{
                    ...getFormatMessageValues(),
                    alternativtGrad: altUttaksgrad,
                    nedreAldersgrense: formatUttaksalder(
                      intl,
                      nedreAldersgrense
                    ),
                  }}
                />
              )}
          </>
        ) : (
          <FormattedMessage
            id="beregning.vilkaarsproeving.alternativer.medAFP.ikkeNokOpptjening"
            values={{
              ...getFormatMessageValues(),
              nedreAldersgrense: formatUttaksalder(intl, nedreAldersgrense),
            }}
          />
        )}
      </Alert>
    )
  }

  if (skalBeregneAfpKap19) {
    logger(ALERT_VIST, {
      tekst: 'Beregning med AFP kapittel 19',
      variant: 'warning',
    })

    return (
      <Alert variant="warning">
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

  return (
    <Alert variant="warning">
      <FormattedMessage id="beregning.vilkaarsproeving.intro" />
      <FormattedMessage
        id={
          harIkkeNokOpptjening
            ? 'beregning.vilkaarsproeving.intro.ikke_nok_opptjening'
            : 'beregning.vilkaarsproeving.intro.optional'
        }
        values={{
          ...getFormatMessageValues(),
          normertPensjonsalder: formatUttaksalder(intl, normertPensjonsalder),
        }}
      />
      {!harIkkeNokOpptjening &&
        !altGradertUttaksalder &&
        altHeltUttaksalder && (
          <FormattedMessage
            id="beregning.vilkaarsproeving.alternativer.heltUttak"
            values={{
              ...getFormatMessageValues(),
              alternativtHeltStartAar: altHeltUttaksalder.aar,
              alternativtHeltStartMaaned: altHeltUttaksalder.maaneder,
            }}
          />
        )}
      {isHeltUttaksalderLik && altGradertUttaksalder && (
        <FormattedMessage
          id="beregning.vilkaarsproeving.alternativer.gradertUttak"
          values={{
            ...getFormatMessageValues(),
            alternativtGrad: altUttaksgrad,
            alternativtGradertStartAar: altGradertUttaksalder.aar,
            alternativtGradertStartMaaned: altGradertUttaksalder.maaneder,
          }}
        />
      )}
      {!isHeltUttaksalderLik && altGradertUttaksalder && altHeltUttaksalder && (
        <FormattedMessage
          id="beregning.vilkaarsproeving.alternativer.heltOgGradertUttak"
          values={{
            ...getFormatMessageValues(),
            alternativtGrad: altUttaksgrad,
            alternativtGradertStartAar: altGradertUttaksalder.aar,
            alternativtGradertStartMaaned: altGradertUttaksalder.maaneder,
            alternativtHeltStartAar: altHeltUttaksalder.aar,
            alternativtHeltStartMaaned: altHeltUttaksalder.maaneder,
          }}
        />
      )}
    </Alert>
  )
}

export default VilkaarsproevingAlert
