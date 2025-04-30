/* c8 disable */
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Alert } from '@navikt/ds-react'

import { useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectNedreAldersgrense,
  selectNormertPensjonsalder,
} from '@/state/userInput/selectors'
import { formatUttaksalder } from '@/utils/alder'
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
  const { gradertUttaksperiode } = useAppSelector(selectCurrentSimulation)
  const normertPensjonsalder = useAppSelector(selectNormertPensjonsalder)
  const nedreAldersgrense = useAppSelector(selectNedreAldersgrense)

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
