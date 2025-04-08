/* c8 disable */
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Alert } from '@navikt/ds-react'

import { useAppSelector } from '@/state/hooks'
import {
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

  const gradertUttaksalder = alternativ?.gradertUttaksalder
  const heltUttaksalder = alternativ?.heltUttaksalder
  const uttaksgrad = alternativ?.uttaksgrad

  if (withAFP) {
    return (
      <Alert variant="warning">
        {alternativ ? (
          <>
            <FormattedMessage id="beregning.vilkaarsproeving.medAFP.intro" />

            {isHeltUttaksalderLik && gradertUttaksalder && (
              <FormattedMessage
                id="beregning.vilkaarsproeving.alternativer.medAFP.gradertUttak"
                values={{
                  ...getFormatMessageValues(),
                  alternativtGrad: uttaksgrad,
                  nedreAldersgrense: formatUttaksalder(intl, nedreAldersgrense),
                }}
              />
            )}

            {!isHeltUttaksalderLik && gradertUttaksalder && (
              <FormattedMessage
                id="beregning.vilkaarsproeving.alternativer.medAFP.heltOgGradertUttak"
                values={{
                  ...getFormatMessageValues(),
                  alternativtGrad: uttaksgrad,
                  alternativtHeltStartAar: heltUttaksalder?.aar,
                  alternativtHeltStartMaaned: heltUttaksalder?.maaneder,
                  nedreAldersgrense: formatUttaksalder(intl, nedreAldersgrense),
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
      {!harIkkeNokOpptjening && !gradertUttaksalder && heltUttaksalder && (
        <FormattedMessage
          id="beregning.vilkaarsproeving.alternativer.heltUttak"
          values={{
            ...getFormatMessageValues(),
            alternativtHeltStartAar: heltUttaksalder.aar,
            alternativtHeltStartMaaned: heltUttaksalder.maaneder,
          }}
        />
      )}
      {isHeltUttaksalderLik && gradertUttaksalder && (
        <FormattedMessage
          id="beregning.vilkaarsproeving.alternativer.gradertUttak"
          values={{
            ...getFormatMessageValues(),
            alternativtGrad: uttaksgrad,
            alternativtGradertStartAar: gradertUttaksalder.aar,
            alternativtGradertStartMaaned: gradertUttaksalder.maaneder,
          }}
        />
      )}
      {!isHeltUttaksalderLik && gradertUttaksalder && heltUttaksalder && (
        <FormattedMessage
          id="beregning.vilkaarsproeving.alternativer.heltOgGradertUttak"
          values={{
            ...getFormatMessageValues(),
            alternativtGrad: uttaksgrad,
            alternativtGradertStartAar: gradertUttaksalder.aar,
            alternativtGradertStartMaaned: gradertUttaksalder.maaneder,
            alternativtHeltStartAar: heltUttaksalder.aar,
            alternativtHeltStartMaaned: heltUttaksalder.maaneder,
          }}
        />
      )}
    </Alert>
  )
}

export default VilkaarsproevingAlert
