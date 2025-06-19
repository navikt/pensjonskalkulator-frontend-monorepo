import React from 'react'
import { useIntl } from 'react-intl'

import { Box, HStack, Heading, VStack } from '@navikt/ds-react'

import {
  UTTAKSALDER_FOR_AP_VED_PRE2025_OFFENTLIG_AFP,
  formatUttaksalder,
} from '@/utils/alder'

import { Pensjonsdata } from '../hooks'
import { PensjonDataVisning } from './PensjonDataVisning'

interface Props {
  pensjonsdata: Pensjonsdata[]
  summerYtelser: (data: Pensjonsdata) => number
  hentUttaksmaanedOgAar: (alder: Alder) => string
}

export const PensjonVisningDesktop: React.FC<Props> = ({
  pensjonsdata,
  summerYtelser,
  hentUttaksmaanedOgAar,
}) => {
  const intl = useIntl()

  if (!pensjonsdata.length) return null

  return (
    <HStack gap="4 8" width="100%" marginBlock="2 0">
      {pensjonsdata.map((data, index) => {
        const isKapittel20AldersPensjon =
          data.alderspensjon &&
          !data.afp &&
          !data.pensjonsavtale &&
          !data.pre2025OffentligAfp

        const isKapittel19OffentligAFP =
          data.pre2025OffentligAfp && !data.alderspensjon

        const formattedUttaksalder =
          data.alderspensjon && data.pre2025OffentligAfp
            ? `${UTTAKSALDER_FOR_AP_VED_PRE2025_OFFENTLIG_AFP.aar} år`
            : formatUttaksalder(intl, data.alder)

        return (
          <Box
            key={`desktop-${index}`}
            borderRadius="medium"
            paddingInline="6"
            paddingBlock="4"
            background="bg-subtle"
            maxWidth={{ sm: '27rem', md: '31rem' }}
            flexGrow="1"
            height="fit-content"
          >
            <VStack gap="1">
              <Heading
                size="xsmall"
                level="4"
                data-testid="maanedsbeloep-desktop-title"
              >
                {`${intl.formatMessage({
                  id: 'beregning.avansert.maanedsbeloep.box_title',
                })}
              ${formattedUttaksalder}
              ${
                ((isKapittel20AldersPensjon || isKapittel19OffentligAFP) &&
                  ` (${hentUttaksmaanedOgAar(data.alder)})`) ||
                ''
              }`}
              </Heading>

              <PensjonDataVisning
                pensjonsdata={data}
                summerYtelser={summerYtelser}
                hentUttaksMaanedOgAar={hentUttaksmaanedOgAar}
              />
            </VStack>
          </Box>
        )
      })}
    </HStack>
  )
}
