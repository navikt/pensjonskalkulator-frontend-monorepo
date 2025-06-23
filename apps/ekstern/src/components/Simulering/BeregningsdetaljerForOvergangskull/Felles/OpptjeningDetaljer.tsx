import React, { Fragment } from 'react'
import { FormattedMessage } from 'react-intl'

import { HStack, VStack } from '@navikt/ds-react'

import { DetaljRad } from '../hooks'

import styles from './Pensjonsdetaljer.module.scss'

export interface OpptjeningDetaljerProps {
  opptjeningKap19Liste: DetaljRad[][]
  opptjeningKap20Liste: DetaljRad[][]
}

export const OpptjeningDetaljer: React.FC<OpptjeningDetaljerProps> = ({
  opptjeningKap19Liste,
  opptjeningKap20Liste,
}) => {
  // Render sections in the correct order for gradert uttak
  const renderOpptjeningSections = () => {
    const maxLength = Math.max(
      opptjeningKap19Liste?.length || 0,
      opptjeningKap20Liste?.length || 0
    )

    const sectionGroups = []

    for (let i = 0; i < maxLength; i++) {
      const sectionsInGroup = []

      // Render Kap 19 section for this index
      if (opptjeningKap19Liste?.[i]?.length > 0) {
        sectionsInGroup.push(
          <dl key={`kap19-${i}`}>
            <div className={styles.hstackRow}>
              <strong>
                <FormattedMessage id="beregning.detaljer.OpptjeningDetaljer.kap19.table.title" />
              </strong>
            </div>
            {opptjeningKap19Liste[i].map((detalj, index) => (
              <Fragment key={index}>
                <HStack justify="space-between" className={styles.hstackRow}>
                  <dt>{`${detalj.tekst}:`}</dt>
                  <dd>{detalj.verdi}</dd>
                </HStack>
              </Fragment>
            ))}
          </dl>
        )
      }

      // Render Kap 20 section for this index
      if (opptjeningKap20Liste?.[i]?.length > 0) {
        sectionsInGroup.push(
          <dl key={`kap20-${i}`}>
            <div className={styles.hstackRow}>
              <strong>
                <FormattedMessage id="beregning.detaljer.OpptjeningDetaljer.kap20.table.title" />
              </strong>
            </div>
            {opptjeningKap20Liste[i].map((detalj, index) => (
              <Fragment key={index}>
                <HStack justify="space-between" className={styles.hstackRow}>
                  <dt>{`${detalj.tekst}:`}</dt>
                  <dd>{detalj.verdi}</dd>
                </HStack>
              </Fragment>
            ))}
          </dl>
        )
      }

      // Only add the group if it has sections
      if (sectionsInGroup.length > 0) {
        sectionGroups.push(
          <VStack key={`group-${i}`} gap="8">
            {sectionsInGroup}
          </VStack>
        )
      }
    }

    return sectionGroups
  }

  return (
    <section>
      <VStack gap="20">{renderOpptjeningSections()}</VStack>
    </section>
  )
}
