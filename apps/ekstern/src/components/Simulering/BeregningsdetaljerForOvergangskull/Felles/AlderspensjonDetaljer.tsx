import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Box, HStack, VStack } from '@navikt/ds-react'

import { AlderspensjonDetaljerListe } from '../hooks'

import beregningsdetaljerStyles from '../BeregningsdetaljerForOvergangskull.module.scss'
import styles from './Pensjonsdetaljer.module.scss'

export interface AlderspensjonDetaljerProps {
  alderspensjonDetaljForValgtUttak: AlderspensjonDetaljerListe
}

const titles: Record<string, string> = {
  alderspensjon: 'beregning.detaljer.grunnpensjon.table.title',
  opptjeningKap19: 'beregning.detaljer.OpptjeningDetaljer.kap19.table.title',
  opptjeningKap20: 'beregning.detaljer.OpptjeningDetaljer.kap20.table.title',
}

const formatDetaljVerdi = (
  detalj: { tekst: string; verdi: string },
  isBold: boolean
): React.ReactNode => {
  let formatertVerdi

  switch (detalj.tekst) {
    case 'Poengår':
    case 'Trygdetid':
      formatertVerdi = `${detalj.verdi} år`
      break
    case 'AFP grad':
      formatertVerdi = `${detalj.verdi} %`
      break
    default:
      formatertVerdi = detalj.verdi
  }

  return isBold ? <strong>{formatertVerdi}</strong> : formatertVerdi
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
          {renderDetaljer(alderspensjonDetaljForValgtUttak)}
        </HStack>
      </div>
      <div
        className={
          beregningsdetaljerStyles.beregningsdetaljerForOvergangskullMobileOnly
        }
      >
        <VStack gap="4 8" width="100%" marginBlock="2 0">
          {renderDetaljer(alderspensjonDetaljForValgtUttak)}
        </VStack>
      </div>
    </Box>
  )
}

function renderDetaljer(
  alderspensjonDetaljForValgtUttak: AlderspensjonDetaljerListe
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
              <FormattedMessage id={titles[key]} />
            </strong>
          </div>
          {row.map((detalj: { tekst: string; verdi: string }, index) => {
            const isBold = index === row.length - 1 && key === 'alderspensjon'
            const formatertVerdi = formatDetaljVerdi(detalj, isBold)

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
                  <dd>{formatertVerdi}</dd>
                </HStack>
              </React.Fragment>
            )
          })}
        </dl>
      )
    }
  )
}
