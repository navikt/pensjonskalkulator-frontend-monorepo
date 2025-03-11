import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong } from '@navikt/ds-react'

import { useAppSelector } from '@/state/hooks'
import { selectIsEndring } from '@/state/userInput/selectors'
import { formatUttaksalder } from '@/utils/alder'
import { formatInntekt } from '@/utils/inntekt'

import styles from './SimuleringEndringBanner.module.scss'

interface Props {
  heltUttaksalder: Alder | null
  gradertUttaksperiode?: GradertUttak
  alderspensjonMaanedligVedEndring?: AlderspensjonMaanedligVedEndring
  isLoading: boolean
}

export const SimuleringEndringBanner: React.FC<Props> = ({
  heltUttaksalder,
  gradertUttaksperiode,
  alderspensjonMaanedligVedEndring,
  isLoading,
}) => {
  const intl = useIntl()
  const isEndring = useAppSelector(selectIsEndring)

  if (!isEndring || !heltUttaksalder) {
    return null
  }

  return (
    <aside className={styles.wrapper}>
      <BodyLong>
        <FormattedMessage id="beregning.avansert.endring_banner.title" />
        {gradertUttaksperiode || isLoading ? (
          ''
        ) : (
          <>
            {formatUttaksalder(intl, heltUttaksalder, { compact: true })}{' '}
            <span className="nowrap">(100 %)</span>:{' '}
            <strong>
              {formatInntekt(
                alderspensjonMaanedligVedEndring?.heltUttakMaanedligBeloep
              )}{' '}
              <FormattedMessage id="beregning.avansert.endring_banner.kr_md" />
            </strong>
          </>
        )}
      </BodyLong>

      {gradertUttaksperiode &&
        !isLoading &&
        alderspensjonMaanedligVedEndring?.gradertUttakMaanedligBeloep !==
          undefined && (
          <ul className={styles.list}>
            <li>
              {formatUttaksalder(intl, gradertUttaksperiode.uttaksalder, {
                compact: true,
              })}{' '}
              <span className="nowrap">({gradertUttaksperiode.grad} %)</span>:{' '}
              <strong>
                {formatInntekt(
                  alderspensjonMaanedligVedEndring?.gradertUttakMaanedligBeloep
                )}{' '}
                <FormattedMessage id="beregning.avansert.endring_banner.kr_md" />
              </strong>
            </li>
            <li>
              {formatUttaksalder(intl, heltUttaksalder, { compact: true })}{' '}
              <span className="nowrap">(100 %)</span>:{' '}
              <strong>
                {formatInntekt(
                  alderspensjonMaanedligVedEndring?.heltUttakMaanedligBeloep
                )}{' '}
                <FormattedMessage id="beregning.avansert.endring_banner.kr_md" />
              </strong>
            </li>
          </ul>
        )}
    </aside>
  )
}
