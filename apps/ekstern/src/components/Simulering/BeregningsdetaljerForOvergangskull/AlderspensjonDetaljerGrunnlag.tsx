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

export const AlderspensjonDetaljerGrunnlag: React.FC<Props> = ({
  alderspensjonDetaljerListe,
  hasPre2025OffentligAfpUttaksalder,
}) => {
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
            <VStack gap="4 8" width="100%" marginBlock="2 0">
              {renderHeading(index)}
              {renderDetaljer(alderspensjonDetaljForValgtUttak)}
            </VStack>
          </Box>
        )
      )}
    </VStack>
  )

  function renderHeading(index: number = 0) {
    const { uttaksalder, gradertUttaksperiode } = useAppSelector(
      selectCurrentSimulation
    )
    const isGradertUttak = Boolean(
      gradertUttaksperiode &&
        !hasPre2025OffentligAfpUttaksalder &&
        gradertUttaksperiode?.uttaksalder.aar !== uttaksalder?.aar &&
        gradertUttaksperiode.grad > 0
    )
    return index === 0 && isGradertUttak ? (
      <Heading size="small" level="4">
        <FormattedMessage
          id="beregning.detaljer.grunnpensjon.gradertUttak.title"
          values={{
            ...getFormatMessageValues(),
            alderAar: `${gradertUttaksperiode?.uttaksalder.aar} år`,
            alderMd:
              gradertUttaksperiode?.uttaksalder.maaneder &&
              gradertUttaksperiode.uttaksalder.maaneder > 0
                ? `og ${gradertUttaksperiode.uttaksalder.maaneder} måneder`
                : '',
            grad: gradertUttaksperiode?.grad,
          }}
        />
      </Heading>
    ) : (
      <Heading size="small" level="4">
        <FormattedMessage
          id="beregning.detaljer.grunnpensjon.heltUttak.title"
          values={{
            ...getFormatMessageValues(),
            alderAar: hasPre2025OffentligAfpUttaksalder
              ? '67 år'
              : `${uttaksalder?.aar} år`,
            alderMd: hasPre2025OffentligAfpUttaksalder
              ? ''
              : uttaksalder?.maaneder && uttaksalder.maaneder > 0
                ? `og ${uttaksalder.maaneder} måneder`
                : '',
            grad: 100,
          }}
        />
      </Heading>
    )
  }
}
