import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Box, HStack, VStack } from '@navikt/ds-react'

import { AlderspensjonDetaljerListe } from '../hooks'

import beregningsdetaljerStyles from '../BeregningsdetaljerForOvergangskull.module.scss'
import styles from './Pensjonsdetaljer.module.scss'

export interface AlderspensjonDetaljerProps {
  alderspensjonDetaljForValgtUttak: AlderspensjonDetaljerListe
}

const getTitle = (
  key: string,
  alderspensjonDetaljForValgtUttak: AlderspensjonDetaljerListe
) => {
  const hasKap19 = alderspensjonDetaljForValgtUttak.opptjeningKap19.length > 0
  const hasKap20 = alderspensjonDetaljForValgtUttak.opptjeningKap20.length > 0
  const hasBothChapters = hasKap19 && hasKap20

  switch (key) {
    case 'alderspensjon':
      return 'beregning.detaljer.grunnpensjon.table.title'
    case 'opptjeningKap19':
      return hasBothChapters
        ? 'beregning.detaljer.OpptjeningDetaljer.kap19.table.title'
        : 'beregning.detaljer.OpptjeningDetaljer.table.title'
    case 'opptjeningKap20':
      return hasBothChapters
        ? 'beregning.detaljer.OpptjeningDetaljer.kap20.table.title'
        : 'beregning.detaljer.OpptjeningDetaljer.table.title'
    default:
      return ''
  }
}

export const AlderspensjonDetaljer: React.FC<AlderspensjonDetaljerProps> = ({
  alderspensjonDetaljForValgtUttak,
}) => {
  return (
    <Box data-testid="beregningsdetaljer-for-overgangskull">
      <div
        className={
          beregningsdetaljerStyles.beregningsdetaljerForOvergangskullDesktopOnly
        }
      >
        <HStack
          gap="12"
          className={styles.hstackRow}
          style={{ borderBottom: 'none' }}
        >
          {renderDetaljer(alderspensjonDetaljForValgtUttak, getTitle)}
        </HStack>
      </div>
      <div
        className={
          beregningsdetaljerStyles.beregningsdetaljerForOvergangskullMobileOnly
        }
      >
        <VStack gap="4 8" width="100%" marginBlock="2 0">
          {renderDetaljer(alderspensjonDetaljForValgtUttak, getTitle)}
        </VStack>
      </div>
    </Box>
  )
}

function renderDetaljer(
  alderspensjonDetaljForValgtUttak: AlderspensjonDetaljerListe,
  getTitleKey: (key: string, data: AlderspensjonDetaljerListe) => string
) {
  return Object.entries(alderspensjonDetaljForValgtUttak).map(
    ([key, row]: [string, []]) => {
      if (!row || row.length === 0) {
        return null
      }
      return (
        <dl key={key}>
          <div className={styles.hstackRow}>
            <strong>
              <FormattedMessage
                id={getTitleKey(key, alderspensjonDetaljForValgtUttak)}
              />
            </strong>
          </div>
          {row.map((detalj: { tekst: string; verdi: string }, index) => {
            const isBold = index === row.length - 1 && key === 'alderspensjon'
            return (
              <React.Fragment key={index}>
                <HStack justify="space-between" className={styles.hstackRow}>
                  <dt style={{ marginRight: '1rem' }}>
                    {isBold ? (
                      <strong>{detalj.tekst}:</strong>
                    ) : (
                      `${detalj.tekst}:`
                    )}
                  </dt>
                  <dd>
                    {isBold ? <strong>{detalj.verdi}</strong> : detalj.verdi}
                  </dd>
                </HStack>
              </React.Fragment>
            )
          })}
        </dl>
      )
    }
  )
}
