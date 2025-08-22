import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Box, Heading, VStack } from '@navikt/ds-react'

import { useAppSelector } from '@/state/hooks'
import { selectCurrentSimulation } from '@/state/userInput/selectors'
import { getFormatMessageValues } from '@/utils/translations'

import { AfpDetaljer } from './Felles/AfpDetaljer'
import { AfpDetaljerListe } from './hooks'

interface HeadingProps {
  messageId: string
  age: number
  months?: number
}

const renderAfpHeading = ({ messageId, age, months }: HeadingProps) => (
  <Heading size="small" level="4">
    <FormattedMessage
      id={messageId}
      values={{
        ...getFormatMessageValues(),
        alderAar: `${age} år`,
        alderMd: months && months > 0 ? `og ${months} måneder` : '',
      }}
    />
  </Heading>
)

interface Props {
  afpDetaljerListe: AfpDetaljerListe[]
  alderspensjonColumnsCount: number
}

export const AfpDetaljerGrunnlag: React.FC<Props> = ({
  afpDetaljerListe,
  alderspensjonColumnsCount,
}) => {
  const { uttaksalder, gradertUttaksperiode } = useAppSelector(
    selectCurrentSimulation
  )

  const renderDetaljer = (afpDetaljForValgtUttak: AfpDetaljerListe) => (
    <AfpDetaljer
      afpDetaljForValgtUttak={afpDetaljForValgtUttak}
      alderspensjonColumnsCount={alderspensjonColumnsCount}
    />
  )

  return (
    <VStack
      gap="14"
      width="100%"
      data-testid="beregningsdetaljer-for-overgangskull"
    >
      {afpDetaljerListe.map((afpDetaljForValgtUttak, index) => (
        <Box key={index}>
          <VStack gap="4 8" width="100%" marginBlock="6 4">
            {renderHeading(afpDetaljForValgtUttak, index)}
            {renderDetaljer(afpDetaljForValgtUttak)}
          </VStack>
        </Box>
      ))}
    </VStack>
  )

  function renderHeading(
    afpDetaljForValgtUttak: AfpDetaljerListe,
    index: number = 0
  ) {
    // For AFP Privat - håndter både gradert uttak og 67-års overskrifter
    if (afpDetaljForValgtUttak.afpPrivat.length > 0) {
      // Bestem første alder (yngste mellom gradert uttak og helt uttak)
      const firstAge =
        gradertUttaksperiode?.uttaksalder?.aar ?? uttaksalder?.aar
      const firstMonths =
        gradertUttaksperiode?.uttaksalder?.maaneder ?? uttaksalder?.maaneder

      // Vis første heading når index er 0 og første alder er mindre enn 67
      if (index === 0 && firstAge && firstAge < 67) {
        return renderAfpHeading({
          messageId: 'beregning.detaljer.afpPrivat.gradertUttak.title',
          age: firstAge,
          months: firstMonths,
        })
      }

      // Vis andre heading for 67-års når index er 1 og yngste alder er mindre enn 67
      if (index === 1 && firstAge && firstAge < 67) {
        return renderAfpHeading({
          messageId: 'beregning.detaljer.afpPrivat.heltUttak.title',
          age: 67,
        })
      }

      // For uttaksaldre større enn 67 skal kun en heading rendres
      if (firstAge && firstAge >= 67) {
        return renderAfpHeading({
          messageId: 'beregning.detaljer.afpPrivat.heltUttak.title',
          age: firstAge,
          months: firstMonths,
        })
      }
    }

    // For AFP Offentlig
    if (afpDetaljForValgtUttak.afpOffentlig.length > 0) {
      const currentAge =
        gradertUttaksperiode?.uttaksalder?.aar ?? uttaksalder?.aar
      const currentMonths =
        gradertUttaksperiode?.uttaksalder?.maaneder ?? uttaksalder?.maaneder

      if (currentAge) {
        return renderAfpHeading({
          messageId: 'beregning.detaljer.afpOffentlig.uttak.title',
          age: currentAge,
          months: currentMonths,
        })
      }
    }

    // For Pre-2025 Offentlig AFP
    if (afpDetaljForValgtUttak.pre2025OffentligAfp.length > 0) {
      if (uttaksalder?.aar) {
        return renderAfpHeading({
          messageId:
            'beregning.detaljer.grunnpensjon.pre2025OffentligAfp.title',
          age: uttaksalder.aar,
          months: uttaksalder.maaneder,
        })
      }
    }

    return null
  }
}
