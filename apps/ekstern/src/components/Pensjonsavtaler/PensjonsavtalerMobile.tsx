import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Heading, VStack } from '@navikt/ds-react'

import { Divider } from '@/components/common/Divider'
import { formatWithoutDecimal } from '@/utils/inntekt'
import { capitalize } from '@/utils/string'

import * as utils from './utils'

interface IPensjonsavtalerProps {
  pensjonsavtaler: Pensjonsavtale[]
}

const Pensjonsavtaler: React.FC<IPensjonsavtalerProps> = ({
  pensjonsavtaler,
}) => {
  const intl = useIntl()
  return pensjonsavtaler.map((avtale) => (
    <div key={`${avtale.key}-mobile`}>
      <Heading size="xsmall">{avtale.produktbetegnelse}</Heading>
      <table style={{ width: '100%' }}>
        <tbody>
          {avtale.utbetalingsperioder.map((utbetalingsperiode) => (
            <tr key={`${JSON.stringify(utbetalingsperiode)}-mobile`}>
              <th style={{ fontWeight: 'normal' }} scope="row" align="left">
                {utbetalingsperiode.sluttAlder
                  ? utils.formaterSluttAlderString(intl)(
                      utbetalingsperiode.startAlder,
                      utbetalingsperiode.sluttAlder
                    )
                  : utils.formaterLivsvarigString(intl)(
                      utbetalingsperiode.startAlder
                    )}
                :
              </th>
              <td align="right">
                {formatWithoutDecimal(utbetalingsperiode.aarligUtbetaling)}{' '}
                <FormattedMessage id="pensjonsavtaler.kr_pr_aar" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ))
}

interface IAvtaleGruppeProps {
  avtale: string
  pensjonsavtaler: Pensjonsavtale[]
}

const AvtaleGruppe: React.FC<IAvtaleGruppeProps> = ({
  avtale,
  pensjonsavtaler,
}) => {
  return (
    <VStack gap="3">
      <Heading size="small">{capitalize(avtale)}</Heading>
      <Pensjonsavtaler pensjonsavtaler={pensjonsavtaler} />
    </VStack>
  )
}

interface IProps {
  pensjonsavtaler: Pensjonsavtale[]
}

export const PensjonsavtalerMobil: React.FC<IProps> = ({ pensjonsavtaler }) => {
  const gruppertePensjonsavtaler = React.useMemo(() => {
    return utils.groupPensjonsavtalerByType(pensjonsavtaler)
  }, [pensjonsavtaler])

  return (
    <VStack>
      {Object.entries(gruppertePensjonsavtaler).map(
        ([avtaleGruppe, gruppePensjonsavtaler]) => (
          <>
            <AvtaleGruppe
              key={`${avtaleGruppe}-gruppe-mobil`}
              avtale={avtaleGruppe}
              pensjonsavtaler={gruppePensjonsavtaler}
            />
            <Divider key={`${avtaleGruppe}-divider`} />
          </>
        )
      )}
    </VStack>
  )
}
