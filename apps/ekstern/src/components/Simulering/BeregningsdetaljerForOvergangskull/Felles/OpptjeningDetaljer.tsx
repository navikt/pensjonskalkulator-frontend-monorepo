import React, { Fragment } from 'react'
import { FormattedMessage } from 'react-intl'

import { HStack, VStack } from '@navikt/ds-react'

import { DetaljRad } from '../hooks'

import styles from './Pensjonsdetaljer.module.scss'

export interface OpptjeningDetaljerProps {
  opptjeningKap19Liste: DetaljRad[][]
  opptjeningKap20Liste: DetaljRad[][]
  alderspensjonDetaljerListe: DetaljRad[][]
}

export const OpptjeningDetaljer: React.FC<OpptjeningDetaljerProps> = ({
  opptjeningKap19Liste,
  opptjeningKap20Liste,
  alderspensjonDetaljerListe,
}) => {
  // Calculate spacing for each VStack section group
  const calculateSectionSpacing = (sectionIndex: number) => {
    const maxOpptjeningLength = Math.max(
      opptjeningKap19Liste?.length || 0,
      opptjeningKap20Liste?.length || 0
    )

    const firstSectionRows = alderspensjonDetaljerListe[0]?.length || 0
    const remainingRows = firstSectionRows - maxOpptjeningLength

    // If only one section in alderspensjonDetaljerListe, simple spacing for first section
    if (alderspensjonDetaljerListe.length === 1) {
      return sectionIndex === 0 ? 'var(--a-spacing-8)' : 'var(--a-spacing-14)'
    }

    // If two sections in alderspensjonDetaljerListe
    if (alderspensjonDetaljerListe.length === 2) {
      if (sectionIndex === 0) {
        return 'var(--a-spacing-8)'
      } else if (remainingRows === 0) {
        return 'var(--a-spacing-14)'
      } else if (sectionIndex === 1) {
        // Calculate offset to align with second alderspensjon section
        const dlRowsHeight = `calc(${remainingRows + 1} * (var(--a-spacing-3) + var(--a-spacing-3)))`
        const gapBetweenSections = 'var(--a-spacing-14)'
        const totalSpacing = `calc(${dlRowsHeight} + ${gapBetweenSections})`
        return totalSpacing
      } else {
        return 'var(--a-spacing-14)'
      }
    }

    return sectionIndex === 0 ? '0' : 'var(--a-spacing-14)'
  }
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
          <HStack
            gap="8"
            key={`group-${i}`}
            style={{ marginTop: calculateSectionSpacing(i) }}
          >
            {sectionsInGroup}
          </HStack>
        )
      }
    }

    return sectionGroups
  }

  return (
    <VStack className={styles.opptjeningDetaljer as string}>
      {renderOpptjeningSections()}
    </VStack>
  )
}
