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
  skalViseNullOffentligTjenestepensjon?: boolean
  erTpFoer1963?: boolean
}

export const PensjonVisningDesktop: React.FC<Props> = ({
  pensjonsdata,
  summerYtelser,
  hentUttaksmaanedOgAar,
  harGradering,
  skalViseNullOffentligTjenestepensjon,
  erTpFoer1963,
}) => {
  const intl = useIntl()

  if (!pensjonsdata.length) return null

  return (
    <HStack gap="4 12" width="100%">
      {pensjonsdata.map((data, index) => {
        const harPre2025OffentligAFP =
          data.pre2025OffentligAfp && data.alderspensjon

        const uttaksAlder =
          harPre2025OffentligAFP || (erTpFoer1963 && index === 1)
            ? UTTAKSALDER_FOR_AP_VED_PRE2025_OFFENTLIG_AFP
            : data.alder

        const formattedUttaksalder =
          harPre2025OffentligAFP || (erTpFoer1963 && index === 1)
            ? `${uttaksAlder.aar} år`
            : formatUttaksalder(intl, uttaksAlder)

        const harKunAPOgPre2025OffentligAFP =
          harPre2025OffentligAFP && !data.afp && !data.pensjonsavtale

        // Vis kalender maaned når det er bare en ytelse eller gammel AFP med AP
        const showKalenderMaaned =
          harKunAPOgPre2025OffentligAFP ||
          erTpFoer1963 ||
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
            paddingBlock="6 0"
            maxWidth={{ sm: '27rem', md: '31rem' }}
            flexGrow="1"
            height="fit-content"
          >
            <VStack>
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
                  ? ` (${hentUttaksmaanedOgAar(uttaksAlder)})`
                  : ''
              }`}
              </Heading>

              <PensjonDataVisning
                pensjonsdata={data}
                summerYtelser={summerYtelser}
                hentUttaksMaanedOgAar={hentUttaksmaanedOgAar}
                harGradering={harGradering}
                skalViseNullOffentligTjenestepensjon={
                  skalViseNullOffentligTjenestepensjon
                }
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
