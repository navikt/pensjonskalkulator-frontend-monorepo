import { FormattedMessage, useIntl } from 'react-intl'

import { Label } from '@navikt/ds-react'
import clsx from 'clsx'

import { SanityReadmore } from '@/components/common/SanityReadmore'
import { EndreInntekt } from '@/components/EndreInntekt'
import { useAppSelector } from '@/state/hooks'
import {
  selectIsEndring,
  selectLoependeVedtak,
} from '@/state/userInput/selectors'
import { formatInntekt } from '@/utils/inntekt'

import styles from './AvansertSkjemaInntekt.module.scss'

interface Props {
  localInntektFremTilUttak: string | null
  aarligInntektFoerUttakBeloep: string | null | undefined
  setLocalInntektFremTilUttak: (value: string | null) => void
}

export const AvansertSkjemaInntekt = ({
  localInntektFremTilUttak,
  aarligInntektFoerUttakBeloep,
  setLocalInntektFremTilUttak,
}: Props) => {
  const intl = useIntl()
  const isEndring = useAppSelector(selectIsEndring)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)

  return (
    <div>
      <Label className={styles.label}>
        <FormattedMessage
          id={
            isEndring
              ? 'beregning.avansert.rediger.inntekt_frem_til_endring.label'
              : 'beregning.avansert.rediger.inntekt_frem_til_uttak.label'
          }
        />
      </Label>

      {!!loependeVedtak.ufoeretrygd.grad && (
        <div className={styles.description}>
          <span className={styles.descriptionText}>
            <FormattedMessage id="beregning.avansert.rediger.inntekt_frem_til_uttak.description_ufoere" />
          </span>
        </div>
      )}

      <div className={styles.description}>
        <span className={styles.descriptionText}>
          <span
            className="nowrap"
            data-testid="formatert-inntekt-frem-til-uttak"
          >
            {formatInntekt(
              localInntektFremTilUttak ?? aarligInntektFoerUttakBeloep
            )}
          </span>
          {` ${intl.formatMessage({ id: 'beregning.avansert.rediger.inntekt_frem_til_uttak.description' })}`}
        </span>

        <EndreInntekt
          visning="avansert"
          buttonLabel="beregning.avansert.rediger.inntekt.button"
          value={localInntektFremTilUttak}
          onSubmit={(uformatertInntekt) => {
            setLocalInntektFremTilUttak(formatInntekt(uformatertInntekt))
          }}
        />
      </div>

      <div className={clsx(styles.spacer, styles.spacer__small)} />

      <SanityReadmore id="om_pensjonsgivende_inntekt" />
    </div>
  )
}
