import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Heading, HeadingProps, VStack } from '@navikt/ds-react'

import { Divider } from '@/components/common/Divider'
import { formatInntekt } from '@/utils/inntekt'
import { capitalize } from '@/utils/string'

import { OffentligTjenestepensjon } from './OffentligTjenestepensjon'
import * as utils from './utils'

interface IPensjonsavtalerProps {
  headingLevel: HeadingProps['level']
  pensjonsavtaler: Pensjonsavtale[]
}

const Pensjonsavtaler: React.FC<IPensjonsavtalerProps> = ({
  headingLevel,
  pensjonsavtaler,
}) => {
  const intl = useIntl()

  return pensjonsavtaler.map((avtale) => (
    <div key={`${avtale.key}`}>
      <Heading level={headingLevel} size="xsmall">
        {avtale.produktbetegnelse}
      </Heading>
      <table className="full-width">
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
                {formatInntekt(utbetalingsperiode.aarligUtbetaling)}{' '}
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
  headingLevel: HeadingProps['level']
  avtale: string
  pensjonsavtaler: Pensjonsavtale[]
}

const AvtaleGruppe: React.FC<IAvtaleGruppeProps> = ({
  headingLevel,
  avtale,
  pensjonsavtaler,
}) => {
  return (
    <VStack gap="3">
      <Heading level={headingLevel} size="small">
        {capitalize(avtale)}
      </Heading>
      <Pensjonsavtaler
        headingLevel={
          headingLevel
            ? ((
                parseInt(headingLevel as string, 10) + 1
              ).toString() as HeadingProps['level'])
            : '4'
        }
        pensjonsavtaler={pensjonsavtaler}
      />
    </VStack>
  )
}

interface IProps {
  headingLevel: HeadingProps['level']
  pensjonsavtaler: Pensjonsavtale[]
}

export const PensjonsavtalerMobil: React.FC<IProps> = ({
  headingLevel,
  pensjonsavtaler,
}) => {
  const gruppertePensjonsavtaler = React.useMemo(() => {
    return utils.groupPensjonsavtalerByType(pensjonsavtaler)
  }, [pensjonsavtaler])

  return (
    <>
      <VStack data-testid="pensjonsavtaler-mobile">
        {Object.entries(gruppertePensjonsavtaler).map(
          ([avtaleGruppe, gruppePensjonsavtaler]) => (
            <div key={`${avtaleGruppe}-gruppe-mobil`}>
              <AvtaleGruppe
                headingLevel={headingLevel}
                avtale={avtaleGruppe}
                pensjonsavtaler={gruppePensjonsavtaler}
              />
              <Divider />
            </div>
          )
        )}
      </VStack>
      <VStack gap="3">
        <OffentligTjenestepensjon headingLevel={headingLevel} />
      </VStack>
      <Divider />
      <BodyLong>
        <FormattedMessage id="pensjonsavtaler.fra_og_med_forklaring" />
      </BodyLong>
    </>
  )
}
