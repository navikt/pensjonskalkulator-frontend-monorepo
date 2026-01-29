import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Box, Heading, VStack } from '@navikt/ds-react'

import { useGetAfpOffentligLivsvarigQuery } from '@/state/api/apiSlice'
import { useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectFoedselsdato,
  selectSamtykkeOffentligAFP,
} from '@/state/userInput/selectors'
import { isAlderOver62 } from '@/utils/alder'
import { getFormatMessageValues } from '@/utils/translations'

import { AfpDetaljer } from './Felles/AfpDetaljer'
import { AfpDetaljerListe } from './hooks'

interface Props {
  afpDetaljerListe: AfpDetaljerListe[]
  alderspensjonColumnsCount: number
  erOffentligTpFoer1963: boolean
}

export const AfpDetaljerGrunnlag: React.FC<Props> = ({
  afpDetaljerListe,
  alderspensjonColumnsCount,
}) => {
  const { uttaksalder, gradertUttaksperiode } = useAppSelector(
    selectCurrentSimulation
  )
  const samtykkeOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const foedselsdato = useAppSelector(selectFoedselsdato)

  const { data: loependeLivsvarigAfpOffentlig } =
    useGetAfpOffentligLivsvarigQuery(undefined, {
      skip:
        !samtykkeOffentligAFP || !foedselsdato || !isAlderOver62(foedselsdato),
    })

  const renderAfpHeading = (
    afpDetaljForValgtUttak: AfpDetaljerListe,
    index: number
  ) => {
    const heading = getAfpHeading({
      afpDetaljForValgtUttak,
      index,
      uttaksalder,
      gradertUttaksperiode,
    })

    if (!heading) {
      return null
    }

    const { messageId, age, months } = heading
    return (
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
  }

  const renderDetaljer = (afpDetaljForValgtUttak: AfpDetaljerListe) => (
    <AfpDetaljer
      afpDetaljForValgtUttak={afpDetaljForValgtUttak}
      alderspensjonColumnsCount={alderspensjonColumnsCount}
    />
  )

  const shouldRenderHeading = (afpDetaljForValgtUttak: AfpDetaljerListe) => {
    // If there's løpende livsvarig AFP offentlig with a positive amount, don't render heading for AFP Offentlig
    if (
      afpDetaljForValgtUttak.afpOffentlig.length > 0 &&
      loependeLivsvarigAfpOffentlig?.afpStatus &&
      loependeLivsvarigAfpOffentlig?.maanedligBeloep &&
      loependeLivsvarigAfpOffentlig.maanedligBeloep > 0
    ) {
      return false
    }
    return true
  }

  return (
    <VStack
      gap="14"
      width="100%"
      data-testid="beregningsdetaljer-for-overgangskull"
    >
      {afpDetaljerListe.map((afpDetaljForValgtUttak, index) => (
        <Box key={index}>
          <VStack gap="4 8" width="100%" marginBlock="6 4">
            {shouldRenderHeading(afpDetaljForValgtUttak) &&
              renderAfpHeading(afpDetaljForValgtUttak, index)}
            {renderDetaljer(afpDetaljForValgtUttak)}
          </VStack>
        </Box>
      ))}
    </VStack>
  )
}

export function getAfpHeading({
  afpDetaljForValgtUttak,
  index,
  uttaksalder,
  gradertUttaksperiode,
}: {
  afpDetaljForValgtUttak: AfpDetaljerListe
  index: number
  uttaksalder: Alder | null
  gradertUttaksperiode: GradertUttak | null
}) {
  // For AFP Privat - håndter både gradert uttak og 67-års overskrifter
  if (afpDetaljForValgtUttak.afpPrivat.length > 0) {
    // Bestem første alder (yngste mellom gradert uttak og helt uttak)
    const firstAge = gradertUttaksperiode?.uttaksalder?.aar ?? uttaksalder?.aar
    const firstMonths =
      gradertUttaksperiode?.uttaksalder?.maaneder ?? uttaksalder?.maaneder

    // Vis første heading når index er 0 og første alder er mindre enn 67
    if (index === 0 && firstAge && firstAge < 67) {
      return {
        messageId: 'beregning.detaljer.afpPrivat.gradertUttak.title',
        age: firstAge,
        months: firstMonths,
      }
    }

    // Vis andre heading for 67-års når index er 1 og yngste alder er mindre enn 67
    if (index === 1 && firstAge && firstAge < 67) {
      return {
        messageId: 'beregning.detaljer.afpPrivat.heltUttak.title',
        age: 67,
      }
    }

    // For uttaksaldre større enn 67 skal kun en heading rendres
    if (firstAge && firstAge >= 67) {
      return {
        messageId: 'beregning.detaljer.afpPrivat.heltUttak.title',
        age: firstAge,
        months: firstMonths,
      }
    }
  }

  // For AFP Offentlig
  if (afpDetaljForValgtUttak.afpOffentlig.length > 0) {
    const currentAge =
      gradertUttaksperiode?.uttaksalder?.aar ?? uttaksalder?.aar
    const currentMonths =
      gradertUttaksperiode?.uttaksalder?.maaneder ?? uttaksalder?.maaneder

    if (currentAge) {
      return {
        messageId: 'beregning.detaljer.afpOffentlig.uttak.title',
        age: currentAge,
        months: currentMonths,
      }
    }
  }

  // For Pre-2025 Offentlig AFP
  if (
    afpDetaljForValgtUttak.pre2025OffentligAfp.length > 0 &&
    uttaksalder?.aar
  ) {
    return {
      messageId: 'beregning.detaljer.grunnpensjon.pre2025OffentligAfp.title',
      age: uttaksalder.aar,
      months: uttaksalder.maaneder,
    }
  }

  // For AFP Offentlig SPK
  if (afpDetaljForValgtUttak.afpOffentligSpk.length > 0 && uttaksalder?.aar) {
    return {
      messageId: 'beregning.detaljer.afp_fra_spk.table.title',
      age: Math.max(65, uttaksalder?.aar ?? 65),
      months: (uttaksalder?.aar ?? 0) < 65 ? 0 : (uttaksalder?.maaneder ?? 0),
    }
  }
  return null
}
