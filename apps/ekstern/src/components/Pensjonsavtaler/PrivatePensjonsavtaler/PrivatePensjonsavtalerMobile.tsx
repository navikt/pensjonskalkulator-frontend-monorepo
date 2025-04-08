import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Heading, HeadingProps, VStack } from '@navikt/ds-react'

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
              {pensjonsavtale.utbetalingsperioder.map((utbetalingsperiode) => (
                <tr key={`${JSON.stringify(utbetalingsperiode)}-mobile`}>
                  <th style={{ fontWeight: 'normal' }} scope="row" align="left">
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
                    :
                  </th>
                  <td align="right">
                    {formatInntekt(utbetalingsperiode.aarligUtbetaling)}{' '}
                    <FormattedMessage id="pensjonsavtaler.kr_pr_aar" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      {avtaleGrupper.map(([avtaleGruppe, gruppePensjonsavtaler], index) => (
        <div key={`${avtaleGruppe}-gruppe-mobil`}>
          <AvtaleGruppe
            headingLevel={headingLevel}
            avtale={avtaleGruppe}
            pensjonsavtaler={gruppePensjonsavtaler}
          />
          {index < avtaleGrupper.length - 1 && <Divider />}
        </div>
      ))}
    </VStack>
  )
}
