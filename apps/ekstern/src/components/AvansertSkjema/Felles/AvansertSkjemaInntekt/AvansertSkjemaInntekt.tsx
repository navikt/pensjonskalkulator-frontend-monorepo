import { FormattedMessage, useIntl } from 'react-intl'

import { Label } from '@navikt/ds-react'
import clsx from 'clsx'

import { ReadMore } from '@/components/common/ReadMore'
import { EndreInntekt } from '@/components/EndreInntekt'
import { InfoOmInntekt } from '@/components/EndreInntekt/InfoOmInntekt'
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
    <>
      <Label
        className={clsx(styles.label, {
          [styles.label__margin]: !isEndring,
        })}
      >
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

      <div className={`${styles.spacer} ${styles.spacer__small}`} />

      <ReadMore
        name="Endring av inntekt i avansert fane"
        header={intl.formatMessage({
          id: 'inntekt.info_om_inntekt.read_more.label',
        })}
      >
        <InfoOmInntekt />
      </ReadMore>
    </>
  )
}
