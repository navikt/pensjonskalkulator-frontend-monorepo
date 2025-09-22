/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyShort, Heading, HeadingProps, VStack } from '@navikt/ds-react'

import { Divider } from '@/components/common/Divider'
import {
  formaterLivsvarigString,
  formaterSluttAlderString,
} from '@/utils/alder'
import { formatInntekt } from '@/utils/inntekt'
import { capitalize } from '@/utils/string'

import { groupPensjonsavtalerByType } from '../utils'

import styles from './PrivatePensjonsavtalerMobile.module.scss'

interface AvtaleGruppeProps {
  headingLevel: HeadingProps['level']
  avtale: string
  pensjonsavtaler: Pensjonsavtale[]
}

const AvtaleGruppe: React.FC<AvtaleGruppeProps> = ({
  headingLevel,
  avtale,
  pensjonsavtaler,
}) => {
  const intl = useIntl()

  const subHeadingLevel = headingLevel
    ? ((
        parseInt(headingLevel as string, 10) + 1
      ).toString() as HeadingProps['level'])
    : '4'

  return (
    <VStack gap="3">
      <Heading level={headingLevel} size="small">
        {capitalize(avtale)}
      </Heading>
      {pensjonsavtaler.map((pensjonsavtale) => (
        <div key={`${pensjonsavtale.key}`}>
          <Heading level={subHeadingLevel} size="xsmall">
            {pensjonsavtale.produktbetegnelse}
          </Heading>
          <table className={styles.table}>
            <tbody>
              {pensjonsavtale.utbetalingsperioder.map(
                (utbetalingsperiode, utbetalingsperiodeIndex) => (
                  <tr key={`utbetalingsperiode-${utbetalingsperiodeIndex}`}>
                    <th
                      style={{
                        fontWeight: 'normal',
                      }}
                      scope="row"
                      align="left"
                    >
                      <BodyShort>
                        {utbetalingsperiode.sluttAlder
                          ? formaterSluttAlderString(
                              intl,
                              utbetalingsperiode.startAlder,
                              utbetalingsperiode.sluttAlder
                            )
                          : formaterLivsvarigString(
                              intl,
                              utbetalingsperiode.startAlder
                            )}
                      </BodyShort>
                    </th>
                    <td align="right" className={styles.valueCell}>
                      {formatInntekt(utbetalingsperiode.aarligUtbetaling)}{' '}
                      <FormattedMessage id="pensjonsavtaler_mobil.kr_pr_aar" />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          <Divider xsmallMargin />
        </div>
      ))}
    </VStack>
  )
}

interface Props {
  headingLevel: HeadingProps['level']
  pensjonsavtaler: Pensjonsavtale[]
}

export const PrivatePensjonsavtalerMobile: React.FC<Props> = ({
  headingLevel,
  pensjonsavtaler,
}) => {
  const gruppertePensjonsavtaler = React.useMemo(() => {
    return groupPensjonsavtalerByType(pensjonsavtaler)
  }, [pensjonsavtaler])

  const avtaleGrupper = Object.entries(gruppertePensjonsavtaler)

  return (
    <VStack data-testid="private-pensjonsavtaler-mobile">
      {avtaleGrupper.map(([avtaleGruppe, gruppePensjonsavtaler]) => (
        <div key={`${avtaleGruppe}-gruppe-mobil`}>
          <AvtaleGruppe
            headingLevel={headingLevel}
            avtale={avtaleGruppe}
            pensjonsavtaler={gruppePensjonsavtaler}
          />
        </div>
      ))}
    </VStack>
  )
}
