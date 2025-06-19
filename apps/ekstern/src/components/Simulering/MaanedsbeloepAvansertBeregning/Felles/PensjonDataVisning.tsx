import clsx from 'clsx'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong } from '@navikt/ds-react'

import { formatUttaksalder } from '@/utils/alder'
import { formatInntektMedKr } from '@/utils/inntekt'

import { Pensjonsdata } from '../hooks'

import styles from './PensjonDataVisning.module.scss'

interface Props {
  pensjonsdata: Pensjonsdata
  summerYtelser: (data: Pensjonsdata) => number
  hentUttaksMaanedOgAar: (alder: Alder) => string
}

export const PensjonDataVisning: React.FC<Props> = ({
  pensjonsdata,
  summerYtelser,
  hentUttaksMaanedOgAar,
}) => {
  const intl = useIntl()
  const {
    alder,
    grad,
    afp,
    pensjonsavtale,
    alderspensjon,
    pre2025OffentligAfp,
  } = pensjonsdata

  const harKunAlderspensjon = alderspensjon && !afp && !pensjonsavtale
  const harAFP = afp || (pre2025OffentligAfp && !alderspensjon)
  const captionTitle = (
    intl.formatMessage({ id: 'beregning.avansert.maanedsbeloep.table_title' }) +
    ' ' +
    intl.formatMessage({ id: 'beregning.avansert.maanedsbeloep.box_title' }) +
    formatUttaksalder(intl, alder)
  ).toLowerCase()

  return (
    <table className={styles.container}>
      <BodyLong as="caption" visuallyHidden>
        {captionTitle}
      </BodyLong>
      <tbody>
        {harAFP && (
          <tr className={styles.row}>
            <th scope="row">
              <BodyLong>
                <FormattedMessage id="beregning.avansert.maanedsbeloep.afp" />:
              </BodyLong>
            </th>
            <td data-testid="maanedsbeloep-avansert-afp">
              {pre2025OffentligAfp
                ? formatInntektMedKr(pre2025OffentligAfp)
                : formatInntektMedKr(afp)}
            </td>
          </tr>
        )}

        {pensjonsavtale > 0 && (
          <tr className={styles.row}>
            <th scope="row">
              <BodyLong>
                <FormattedMessage id="beregning.avansert.maanedsbeloep.pensjonsavtaler" />
                :
              </BodyLong>
            </th>
            <td data-testid="maanedsbeloep-avansert-pensjonsavtale">
              {formatInntektMedKr(pensjonsavtale)}
            </td>
          </tr>
        )}

        {alderspensjon && (
          <tr className={styles.row}>
            <th scope="row">
              <BodyLong>
                <FormattedMessage
                  id="beregning.avansert.maanedsbeloep.alderspensjon"
                  values={{ prosent: grad }}
                />
                :
              </BodyLong>
            </th>
            <td data-testid="maanedsbeloep-avansert-alderspensjon">
              {formatInntektMedKr(alderspensjon)}
            </td>
          </tr>
        )}

        {!harKunAlderspensjon && !pre2025OffentligAfp && (
          <tr
            className={clsx(styles.row, styles.sum)}
            data-testid="maanedsbeloep-avansert-sum"
          >
            <th scope="row">
              <BodyLong>
                <FormattedMessage
                  id="beregning.avansert.maanedsbeloep.sum"
                  values={{ maanedOgAar: hentUttaksMaanedOgAar(alder) }}
                />
                :
              </BodyLong>
            </th>
            <td>{formatInntektMedKr(summerYtelser(pensjonsdata))}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
