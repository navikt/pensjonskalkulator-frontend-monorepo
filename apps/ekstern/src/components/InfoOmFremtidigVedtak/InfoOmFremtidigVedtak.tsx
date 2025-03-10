import { FormattedMessage } from 'react-intl'

import { Alert } from '@navikt/ds-react'
import clsx from 'clsx'

import { getFormatMessageValues } from '@/utils/translations'

import styles from './InfoOmFremtidigVedtak.module.scss'

interface Props {
  loependeVedtak?: LoependeVedtak
  isCentered?: boolean
}

export function InfoOmFremtidigVedtak({ loependeVedtak, isCentered }: Props) {
  if (!loependeVedtak || !loependeVedtak.fremtidigAlderspensjon) {
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
          values={{ ...getFormatMessageValues() }}
        />
      </Alert>
    </>
  )
}
