import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Box, Heading, VStack } from '@navikt/ds-react'

import { useAppSelector } from '@/state/hooks'
import { selectCurrentSimulation } from '@/state/userInput/selectors'
import { getFormatMessageValues } from '@/utils/translations'

import { AlderspensjonDetaljer } from './Felles/AlderspensjonDetaljer'
import { AlderspensjonDetaljerListe } from './hooks'

interface Props {
  alderspensjonDetaljerListe: AlderspensjonDetaljerListe[]
  hasPre2025OffentligAfpUttaksalder: boolean
}

interface ApHeadingProps {
  messageId: string
  age: string
  months: string
  grad?: number
}

export const AlderspensjonDetaljerGrunnlag: React.FC<Props> = ({
  alderspensjonDetaljerListe,
  hasPre2025OffentligAfpUttaksalder,
}) => {
  const { uttaksalder, gradertUttaksperiode } = useAppSelector(
    selectCurrentSimulation
  )

  const renderDetaljer = (
    alderspensjonDetaljForValgtUttak: AlderspensjonDetaljerListe
  ) => (
    <AlderspensjonDetaljer
      alderspensjonDetaljForValgtUttak={alderspensjonDetaljForValgtUttak}
    />
  )

  return (
    <VStack gap="14" width="100%">
      {alderspensjonDetaljerListe.map(
        (alderspensjonDetaljForValgtUttak, index) => (
          <Box key={index}>
            <VStack gap="4 8" width="100%" marginBlock="6 4">
              {renderHeading(index)}
              {renderDetaljer(alderspensjonDetaljForValgtUttak)}
            </VStack>
          </Box>
        )
      )}
    </VStack>
  )

  function renderHeading(index: number = 0) {
    const apHeading = getAlderspensjonHeading({
      index,
      hasPre2025OffentligAfpUttaksalder,
      uttaksalder,
      gradertUttaksperiode,
    })

    return (
      <Heading size="small" level="4">
        <FormattedMessage
          id={apHeading.messageId}
          values={{
            ...getFormatMessageValues(),
            alderAar: apHeading.age,
            alderMd: apHeading.months,
            grad: apHeading.grad,
          }}
        />
      </Heading>
    )
  }
}

export function getAlderspensjonHeading({
  index,
  hasPre2025OffentligAfpUttaksalder,
  uttaksalder,
  gradertUttaksperiode,
}: {
  index: number
  hasPre2025OffentligAfpUttaksalder: boolean
  uttaksalder: Alder | null
  gradertUttaksperiode: GradertUttak | null
}): ApHeadingProps {
  const isGradertUttak = Boolean(
    gradertUttaksperiode &&
    !hasPre2025OffentligAfpUttaksalder &&
    gradertUttaksperiode?.uttaksalder.aar !== uttaksalder?.aar &&
    gradertUttaksperiode.grad > 0
  )

  if (index === 0 && isGradertUttak) {
    return {
      messageId: 'beregning.detaljer.grunnpensjon.gradertUttak.title',
      age: `${gradertUttaksperiode?.uttaksalder.aar} år`,
      months:
        gradertUttaksperiode?.uttaksalder.maaneder &&
        gradertUttaksperiode.uttaksalder.maaneder > 0
          ? `og ${gradertUttaksperiode.uttaksalder.maaneder} måneder`
          : '',
      grad: gradertUttaksperiode?.grad,
    }
  } else {
    return {
      messageId: 'beregning.detaljer.grunnpensjon.heltUttak.title',
      age: hasPre2025OffentligAfpUttaksalder
        ? '67 år'
        : `${uttaksalder?.aar} år`,
      months: hasPre2025OffentligAfpUttaksalder
        ? ''
        : uttaksalder?.maaneder && uttaksalder.maaneder > 0
          ? `og ${uttaksalder.maaneder} måneder`
          : '',
      grad: 100,
    }
  }
}
