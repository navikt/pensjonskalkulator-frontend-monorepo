import React from 'react'

import { Box, HStack, VStack } from '@navikt/ds-react'

import { AlderspensjonDetaljer } from './Felles/AlderspensjonDetaljer'
import { OpptjeningDetaljer } from './Felles/OpptjeningDetaljer'
import { DetaljRad } from './hooks'

import styles from './BeregningsdetaljerForOvergangskull.module.scss'

interface Props {
  alderspensjonDetaljerListe: DetaljRad[][]
  opptjeningKap19Liste: DetaljRad[][]
  opptjeningKap20Liste: DetaljRad[][]
  hasPre2025OffentligAfpUttaksalder: boolean
}

export const AlderspensjonDetaljerGrunnlag: React.FC<Props> = ({
  alderspensjonDetaljerListe,
  opptjeningKap19Liste,
  opptjeningKap20Liste,
  hasPre2025OffentligAfpUttaksalder,
}) => {
  const renderDetaljer = () => (
    <>
      <AlderspensjonDetaljer
        alderspensjonDetaljerListe={alderspensjonDetaljerListe}
        hasPre2025OffentligAfpUttaksalder={hasPre2025OffentligAfpUttaksalder}
      />
      <OpptjeningDetaljer
        opptjeningKap19Liste={opptjeningKap19Liste}
        opptjeningKap20Liste={opptjeningKap20Liste}
        alderspensjonDetaljerListe={alderspensjonDetaljerListe}
      />
    </>
  )

  return (
    <Box data-testid="beregningsdetaljer-for-overgangskull">
      <div className={styles.beregningsdetaljerForOvergangskullDesktopOnly}>
        <HStack gap="10" width="100%">
          {renderDetaljer()}
        </HStack>
      </div>

      <div className={styles.beregningsdetaljerForOvergangskullMobileOnly}>
        <VStack gap="4 8" width="100%" marginBlock="2 0">
          {renderDetaljer()}
        </VStack>
      </div>
    </Box>
  )
}
