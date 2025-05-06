import React from 'react'
import { useIntl } from 'react-intl'

import { Box, HStack, Heading, VStack } from '@navikt/ds-react'

import { formatUttaksalder } from '@/utils/alder'

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
      {pensjonsdata.map((data, index) => (
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
              ${formatUttaksalder(intl, data.alder)}
              ${
                (data.alderspensjon &&
                  !data.afp &&
                  !data.pensjonsavtale &&
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
      ))}
    </HStack>
  )
}
