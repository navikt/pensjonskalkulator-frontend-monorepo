import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyShort } from '@navikt/ds-react'
import clsx from 'clsx'

import { formatAsDecimal } from '@/utils/currency'
import { capitalize } from '@/utils/string'

import { groupPensjonsavtalerByType, getMaanedString } from './utils'

import styles from './GrunnlagPensjonsavtalerTable.module.scss'

interface IProps {
  pensjonsavtaler: Pensjonsavtale[]
}

export const GrunnlagPensjonsavtaleTable = (props: IProps) => {
  const intl = useIntl()
  const { pensjonsavtaler } = props

  return (
    <table data-testid="pensjonsavtaler-table" className={styles.tabell}>
      <thead>
        <tr>
          <th className={styles.tabellHeader}>
            <FormattedMessage id="grunnlag.pensjonsavtaler.tabell.title.left" />
          </th>
          <th className={clsx(styles.tabellHeader, styles.tabellHeader__Right)}>
            <FormattedMessage id="grunnlag.pensjonsavtaler.tabell.title.right" />
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(groupPensjonsavtalerByType(pensjonsavtaler)).map(
          ([avtaleType, avtaler], i) => (
            <React.Fragment key={`table-left-${avtaleType}`}>
              <tr>
                <td colSpan={2}>
                  <BodyShort
                    className={clsx(styles.tabellMellomtittel, {
                      [styles.tabellMellomtittel__First]: i < 1,
                    })}
                  >
                    {capitalize(avtaleType)}
                  </BodyShort>
                </td>
              </tr>
              {avtaler.map((avtale) => (
                <React.Fragment key={`table-right-${avtale.key}`}>
                  <tr>
                    <td colSpan={2}>
                      <BodyShort className={styles.tabellSubtittel}>
                        {avtale.produktbetegnelse}
                      </BodyShort>
                    </td>
                  </tr>
                  {avtale.utbetalingsperioder.map((utbetalingsperiode) => {
                    return (
                      <tr
                        key={`${avtale.key}-${utbetalingsperiode.startAlder.aar}-${utbetalingsperiode.startAlder.maaneder}`}
                      >
                        <td className={styles.tabellCell__Small}>
                          {utbetalingsperiode.sluttAlder
                            ? `${intl.formatMessage({
                                id: 'grunnlag.pensjonsavtaler.fra_og_med',
                              })} ${
                                utbetalingsperiode.startAlder.aar
                              } ${intl.formatMessage({
                                id: 'grunnlag.pensjonsavtaler.aar',
                              })}${getMaanedString(
                                intl.formatMessage,
                                utbetalingsperiode.startAlder.maaneder
                              )} ${intl.formatMessage({
                                id: 'grunnlag.pensjonsavtaler.til_og_med',
                              })} ${
                                utbetalingsperiode.sluttAlder.aar
                              } ${intl.formatMessage({
                                id: 'grunnlag.pensjonsavtaler.aar',
                              })}${
                                utbetalingsperiode.sluttAlder.maaneder &&
                                utbetalingsperiode.sluttAlder.maaneder < 11
                                  ? getMaanedString(
                                      intl.formatMessage,
                                      utbetalingsperiode.sluttAlder.maaneder
                                    )
                                  : ''
                              }`
                            : `${intl.formatMessage({
                                id: 'grunnlag.pensjonsavtaler.livsvarig',
                              })} ${
                                utbetalingsperiode.startAlder.aar
                              } ${intl.formatMessage({
                                id: 'grunnlag.pensjonsavtaler.aar',
                              })}${
                                utbetalingsperiode.startAlder.maaneder
                                  ? getMaanedString(
                                      intl.formatMessage,
                                      utbetalingsperiode.startAlder.maaneder
                                    )
                                  : ''
                              }`}
                        </td>
                        <td
                          className={clsx(
                            styles.tabellCell__Small,
                            styles.tabellCell__Right
                          )}
                        >
                          {`${formatAsDecimal(
                            utbetalingsperiode.aarligUtbetaling
                          )} kr`}
                        </td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </React.Fragment>
          )
        )}
      </tbody>
    </table>
  )
}
