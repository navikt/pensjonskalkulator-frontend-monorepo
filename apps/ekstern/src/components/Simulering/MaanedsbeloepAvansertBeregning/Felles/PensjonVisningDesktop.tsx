import React from 'react'
import { useIntl } from 'react-intl'

import { Box, HStack, Heading, VStack } from '@navikt/ds-react'

import { Divider } from '@/components/common/Divider'
import {
  UTTAKSALDER_FOR_AP_VED_PRE2025_OFFENTLIG_AFP,
  formatUttaksalder,
} from '@/utils/alder'

import { Pensjonsdata } from '../hooks'
import { PensjonDataVisning } from './PensjonDataVisning'

import styles from './PensjonVisningDesktop.module.scss'

interface Props {
  pensjonsdata: Pensjonsdata[]
  summerYtelser: (data: Pensjonsdata) => number
  hentUttaksmaanedOgAar: (alder: Alder) => string
  harGradering?: boolean
}

export const PensjonVisningDesktop: React.FC<Props> = ({
  pensjonsdata,
  summerYtelser,
  hentUttaksmaanedOgAar,
  harGradering,
}) => {
  const intl = useIntl()

  if (!pensjonsdata.length) return null

  return (
    <HStack gap="4 12" width="100%" marginBlock="2 0">
      {pensjonsdata.map((data, index) => {
        const formattedUttaksalder =
          data.alderspensjon && data.pre2025OffentligAfp
            ? `${UTTAKSALDER_FOR_AP_VED_PRE2025_OFFENTLIG_AFP.aar} år`
            : formatUttaksalder(intl, data.alder)

        // Vis kalender maaned når det er bare en ytelse
        const showKalenderMaaned =
          [
            data.alderspensjon,
            data.afp,
            data.pensjonsavtale,
            data.pre2025OffentligAfp,
          ].filter(Boolean).length === 1

        return (
          <Box
            key={`desktop-${index}`}
            borderRadius="medium"
            paddingInline="0 6"
            paddingBlock="4 0"
            maxWidth={{ sm: '27rem', md: '31rem' }}
            flexGrow="1"
            height="fit-content"
          >
            <VStack gap="1">
              <div className={styles.dividerWrapper}>
                <Divider mediumMargin noMarginTop />
              </div>

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
                showKalenderMaaned
                  ? ` (${hentUttaksmaanedOgAar(data.alder)})`
                  : ''
              }`}
              </Heading>

              <PensjonDataVisning
                pensjonsdata={data}
                summerYtelser={summerYtelser}
                hentUttaksMaanedOgAar={hentUttaksmaanedOgAar}
                harGradering={harGradering}
              />
              <div className={styles.dividerWrapper}>
                <Divider mediumMargin noMarginBottom />
              </div>
            </VStack>
          </Box>
        )
      })}
    </HStack>
  )
}
