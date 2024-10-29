import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Alert } from '@navikt/ds-react'
import clsx from 'clsx'

import { getFormatMessageValues } from '@/utils/translations'

import styles from './LoependeVedtakInfo.module.scss'

interface Props {
  loependeVedtak?: LoependeVedtak
  isCentered?: boolean
}

export function LoependeVedtakInfo({ loependeVedtak, isCentered }: Props) {
  const intl = useIntl()

  if (!loependeVedtak || !loependeVedtak?.harFremtidigLoependeVedtak) {
    return null
  }

  return (
    <>
      <Alert
        className={clsx(styles.alert, { [styles.alert__centered]: isCentered })}
        variant="info"
        aria-live="polite"
      >
        <FormattedMessage
          id={
            loependeVedtak.alderspensjon
              ? 'stegvisning.fremtidigvedtak.endring.alert'
              : 'stegvisning.fremtidigvedtak.alert'
          }
          values={{ ...getFormatMessageValues(intl) }}
        />
      </Alert>
    </>
  )
}
