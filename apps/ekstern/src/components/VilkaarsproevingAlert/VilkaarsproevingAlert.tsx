/* c8 disable */
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Alert } from '@navikt/ds-react'

import { useAppSelector } from '@/state/hooks'
import { selectNormertPensjonsalder } from '@/state/userInput/selectors'
import { formatUttaksalder } from '@/utils/alder'
import { getFormatMessageValues } from '@/utils/translations'

export interface Props {
  vilkaarsproeving: Vilkaarsproeving
  uttaksalder: Alder
}

export const VilkaarsproevingAlert: React.FC<Props> = ({
  vilkaarsproeving,
  uttaksalder,
}) => {
  const intl = useIntl()
  const normertPensjonsalder = useAppSelector(selectNormertPensjonsalder)

  const harIkkeNokOpptjening = React.useMemo(() => {
    return (
      JSON.stringify(vilkaarsproeving.alternativ?.heltUttaksalder) ===
        JSON.stringify(normertPensjonsalder) &&
      !vilkaarsproeving.alternativ?.gradertUttaksalder
    )
  }, [vilkaarsproeving])

  const isHeltUttaksalderLik = React.useMemo(() => {
    return (
      JSON.stringify(vilkaarsproeving.alternativ?.heltUttaksalder) ===
      JSON.stringify(uttaksalder)
    )
  }, [vilkaarsproeving])

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
          ...getFormatMessageValues(intl),
          normertPensjonsalder: formatUttaksalder(intl, normertPensjonsalder),
        }}
      />

      {
        // 1. Hvis forslag om ny alder for helt uttak uten forslag for gradert uttak
        !harIkkeNokOpptjening &&
          vilkaarsproeving.alternativ &&
          !vilkaarsproeving.alternativ.gradertUttaksalder && (
            <FormattedMessage
              id="beregning.vilkaarsproeving.alternativer.heltUttak"
              values={{
                ...getFormatMessageValues(intl),
                alternativtHeltStartAar:
                  vilkaarsproeving.alternativ.heltUttaksalder?.aar,
                alternativtHeltStartMaaned:
                  vilkaarsproeving.alternativ.heltUttaksalder?.maaneder,
              }}
            />
          )
      }
      {
        // 2. Hvis forslag om ny alder for gradert uttak uten forslag for helt uttak
        isHeltUttaksalderLik &&
          vilkaarsproeving.alternativ &&
          vilkaarsproeving.alternativ.gradertUttaksalder && (
            <FormattedMessage
              id="beregning.vilkaarsproeving.alternativer.gradertUttak"
              values={{
                ...getFormatMessageValues(intl),
                alternativtGrad: vilkaarsproeving.alternativ.uttaksgrad,
                alternativtGradertStartAar:
                  vilkaarsproeving.alternativ.gradertUttaksalder?.aar,
                alternativtGradertStartMaaned:
                  vilkaarsproeving.alternativ.gradertUttaksalder?.maaneder,
              }}
            />
          )
      }
      {
        // 3. Hvis forslag om ny alder for helt uttak og ny alder for gradert uttak
        !isHeltUttaksalderLik &&
          vilkaarsproeving.alternativ &&
          vilkaarsproeving.alternativ.gradertUttaksalder && (
            <FormattedMessage
              id="beregning.vilkaarsproeving.alternativer.heltOgGradertUttak"
              values={{
                ...getFormatMessageValues(intl),
                alternativtGrad: vilkaarsproeving.alternativ.uttaksgrad,
                alternativtGradertStartAar:
                  vilkaarsproeving.alternativ.gradertUttaksalder?.aar,
                alternativtGradertStartMaaned:
                  vilkaarsproeving.alternativ.gradertUttaksalder?.maaneder,
                alternativtHeltStartAar:
                  vilkaarsproeving.alternativ.heltUttaksalder?.aar,
                alternativtHeltStartMaaned:
                  vilkaarsproeving.alternativ.heltUttaksalder?.maaneder,
              }}
            />
          )
      }
    </Alert>
  )
}

export default VilkaarsproevingAlert
