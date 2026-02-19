import clsx from 'clsx'
import React from 'react'
import { FormattedMessage } from 'react-intl'

import { BodyLong } from '@navikt/ds-react'

import { isAlderOverAnnenAlder } from '@/utils/alder'
import { formatInntektMedKr } from '@/utils/inntekt'

import { Pensjonsdata } from '../hooks'

import styles from './PensjonDataVisning.module.scss'

interface Props {
  pensjonsdata: Pensjonsdata
  summerYtelser: (data: Pensjonsdata) => number
  hentUttaksMaanedOgAar: (alder: Alder) => string
  harGradering?: boolean
  skalViseNullOffentligTjenestepensjon?: boolean
}

export const PensjonDataVisning: React.FC<Props> = ({
  pensjonsdata,
  summerYtelser,
  hentUttaksMaanedOgAar,
  harGradering,
  skalViseNullOffentligTjenestepensjon,
}) => {
  const {
    alder,
    grad,
    afp,
    pensjonsavtale,
    alderspensjon,
    pre2025OffentligAfp,
  } = pensjonsdata

  const skalVisePensjonsavtaler =
    pensjonsavtale > 0 || skalViseNullOffentligTjenestepensjon
  const harKunAlderspensjon = alderspensjon && !afp && !skalVisePensjonsavtaler
  const harAFP = Boolean(
    afp ||
    (pre2025OffentligAfp && !alderspensjon) ||
    (skalViseNullOffentligTjenestepensjon &&
      !isAlderOverAnnenAlder(alder, { aar: 67, maaneder: 0 }))
  )
  const harPre2025OffentligAfpOgPensjonsavtale = Boolean(
    pre2025OffentligAfp && pensjonsavtale
  )

  return (
    <table className={styles.container}>
      <tbody>
        {harAFP && (
          <tr className={styles.row}>
            <th
              scope="row"
              className={clsx(
                styles.monthlyPayoutElement,
                styles.monthlyPayoutElement__purple,
                !harGradering && styles.noGradering
              )}
            >
              <BodyLong>
                <FormattedMessage id="beregning.avansert.maanedsbeloep.afp" />:
              </BodyLong>
            </th>
            <td data-testid="maanedsbeloep-avansert-afp">
              {skalViseNullOffentligTjenestepensjon || pre2025OffentligAfp
                ? formatInntektMedKr(pre2025OffentligAfp)
                : formatInntektMedKr(afp)}
            </td>
          </tr>
        )}

        {skalVisePensjonsavtaler && (
          <tr className={styles.row}>
            <th
              scope="row"
              className={clsx(
                styles.monthlyPayoutElement,
                styles.monthlyPayoutElement__green,
                !harGradering && styles.noGradering
              )}
            >
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
            <th
              scope="row"
              className={clsx(
                styles.monthlyPayoutElement,
                styles.monthlyPayoutElement__blue,
                !harGradering && styles.noGradering
              )}
            >
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

        {!harKunAlderspensjon &&
          (!pre2025OffentligAfp || harPre2025OffentligAfpOgPensjonsavtale) && (
            <tr
              className={clsx(styles.row, styles.sum)}
              data-testid="maanedsbeloep-avansert-sum"
            >
              <th
                scope="row"
                className={clsx(!harGradering && styles.noGradering)}
              >
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
