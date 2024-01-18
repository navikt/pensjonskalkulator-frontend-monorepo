import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyShort } from '@navikt/ds-react'
import clsx from 'clsx'

import { formatWithoutDecimal } from '@/utils/inntekt'
import { capitalize } from '@/utils/string'

import { groupPensjonsavtalerByType, getMaanedString } from './utils'

import styles from './GrunnlagPensjonsavtalerTable.module.scss'

interface IProps {
  pensjonsavtaler: Pensjonsavtale[]
}

export const GrunnlagPensjonsavtalerTable = (props: IProps) => {
  const intl = useIntl()
  const { pensjonsavtaler } = props

  const formaterSluttAlderString = (startAlder: Alder, sluttAlder: Alder) => {
    return `${intl.formatMessage({
      id: 'grunnlag.pensjonsavtaler.fra_og_med',
    })} ${startAlder.aar} ${intl.formatMessage({
      id: 'grunnlag.pensjonsavtaler.aar',
    })}${getMaanedString(
      intl.formatMessage,
      startAlder.maaneder
    )} ${intl.formatMessage({
      id: 'grunnlag.pensjonsavtaler.til_og_med',
    })} ${sluttAlder.aar} ${intl.formatMessage({
      id: 'grunnlag.pensjonsavtaler.aar',
    })}${
      sluttAlder.maaneder && sluttAlder.maaneder < 11
        ? getMaanedString(intl.formatMessage, sluttAlder.maaneder)
        : ''
    }`
  }

  const formaterLivsvarigString = (startAlder: Alder) => {
    return `${intl.formatMessage({
      id: 'grunnlag.pensjonsavtaler.livsvarig',
    })} ${startAlder.aar} ${intl.formatMessage({
      id: 'grunnlag.pensjonsavtaler.aar',
    })}${
      startAlder.maaneder
        ? getMaanedString(intl.formatMessage, startAlder.maaneder)
        : ''
    }`
  }

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
                <th colSpan={2}>
                  <BodyShort
                    className={clsx(styles.tabellMellomtittel, {
                      [styles.tabellMellomtittel__First]: i < 1,
                    })}
                  >
                    {capitalize(avtaleType)}
                  </BodyShort>
                </th>
              </tr>
              {avtaler.map((avtale) => (
                <React.Fragment key={`table-right-${avtale.key}`}>
                  <tr>
                    <th colSpan={2}>
                      <BodyShort className={styles.tabellSubtittel}>
                        {avtale.produktbetegnelse}
                      </BodyShort>
                    </th>
                  </tr>
                  {avtale.utbetalingsperioder.map((utbetalingsperiode) => {
                    return (
                      <tr
                        key={`${avtale.key}-${utbetalingsperiode.startAlder.aar}-${utbetalingsperiode.startAlder.maaneder}`}
                      >
                        <td className={styles.tabellCell__Small}>
                          {utbetalingsperiode.sluttAlder
                            ? formaterSluttAlderString(
                                utbetalingsperiode.startAlder,
                                utbetalingsperiode.sluttAlder
                              )
                            : formaterLivsvarigString(
                                utbetalingsperiode.startAlder
                              )}
                        </td>
                        <td
                          className={clsx(
                            styles.tabellCell__Small,
                            styles.tabellCell__Right
                          )}
                        >
                          {`${formatWithoutDecimal(
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
