import React from 'react'

import { Box, HStack, VStack } from '@navikt/ds-react'

import { AfpDetaljer } from './Felles/AfpDetaljer'
import { DetaljRad } from './hooks'

import styles from './BeregningsdetaljerForOvergangskull.module.scss'

interface Props {
  afpPrivatDetaljerListe?: DetaljRad[][]
  afpOffentligDetaljerListe?: DetaljRad[]
  pre2025OffentligAfpDetaljerListe?: DetaljRad[]
  opptjeningPre2025OffentligAfpListe?: DetaljRad[]
}

export const AfpDetaljerGrunnlag: React.FC<Props> = ({
  afpPrivatDetaljerListe,
  afpOffentligDetaljerListe,
  pre2025OffentligAfpDetaljerListe,
  opptjeningPre2025OffentligAfpListe,
}) => {
  const renderDetaljer = () => (
    <AfpDetaljer
      afpPrivatDetaljerListe={afpPrivatDetaljerListe}
      afpOffentligDetaljerListe={afpOffentligDetaljerListe}
      pre2025OffentligAfpDetaljerListe={pre2025OffentligAfpDetaljerListe}
      opptjeningPre2025OffentligAfpListe={opptjeningPre2025OffentligAfpListe}
    />
  )

  return (
    <Box data-testid="beregningsdetaljer-for-overgangskull">
      <div className={styles.beregningsdetaljerForOvergangskullDesktopOnly}>
        <HStack gap="20" width="100%">
          {renderDetaljer()}
        </HStack>
      </div>

      <div className={styles.beregningsdetaljerForOvergangskullMobileOnly}>
        <VStack gap="4 8" width="100%" marginBlock="6 4">
          {renderDetaljer()}
        </VStack>
      </div>
    </Box>
  )
}
