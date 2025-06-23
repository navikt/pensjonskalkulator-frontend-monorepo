import React from 'react'

import { Box, HStack, VStack } from '@navikt/ds-react'

import { AfpDetaljer } from './Felles/AfpDetaljer'
import { AlderspensjonDetaljer } from './Felles/AlderspensjonDetaljer'
import { OpptjeningDetaljer } from './Felles/OpptjeningDetaljer'
import { useBeregningsdetaljer } from './hooks'

import styles from './BeregningsdetaljerForOvergangskull.module.scss'

interface Props {
  alderspensjonListe?: AlderspensjonPensjonsberegning[]
  afpPrivatListe?: AfpPrivatPensjonsberegning[]
  afpOffentligListe?: AfpPensjonsberegning[]
  pre2025OffentligAfp?: pre2025OffentligPensjonsberegning
}

export const BeregningsdetaljerForOvergangskull: React.FC<Props> = ({
  alderspensjonListe,
  afpPrivatListe,
  afpOffentligListe,
  pre2025OffentligAfp,
}) => {
  const {
    alderspensjonDetaljerListe,
    pre2025OffentligAfpDetaljerListe,
    opptjeningKap19Liste,
    opptjeningKap20Liste,
    afpPrivatDetaljerListe,
    afpOffentligDetaljerListe,
    opptjeningPre2025OffentligAfpListe,
  } = useBeregningsdetaljer(
    alderspensjonListe,
    afpPrivatListe,
    afpOffentligListe,
    pre2025OffentligAfp
  )

  const renderDetaljer = () => (
    <>
      <AlderspensjonDetaljer
        alderspensjonDetaljerListe={alderspensjonDetaljerListe}
        hasPre2025OffentligAfpUttaksalder={Boolean(
          opptjeningPre2025OffentligAfpListe?.length
        )}
      />
      <OpptjeningDetaljer
        opptjeningKap19Liste={opptjeningKap19Liste}
        opptjeningKap20Liste={opptjeningKap20Liste}
      />
      <AfpDetaljer
        afpPrivatDetaljerListe={afpPrivatDetaljerListe}
        afpOffentligDetaljerListe={afpOffentligDetaljerListe}
        pre2025OffentligAfpDetaljerListe={pre2025OffentligAfpDetaljerListe}
        opptjeningPre2025OffentligAfpListe={opptjeningPre2025OffentligAfpListe}
      />
    </>
  )

  return (
    <Box marginBlock="10 0" data-testid="beregningsdetaljer-for-overgangskull">
      <div className={styles.beregningsdetaljerForOvergangskullDesktopOnly}>
        <HStack gap="20" width="100%">
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
