import clsx from 'clsx'
import { format, parseISO } from 'date-fns'
import { FormattedMessage } from 'react-intl'

import { Alert } from '@navikt/ds-react'

import { DATE_ENDUSER_FORMAT } from '@/utils/dates'

import styles from './InfoOmFremtidigVedtak.module.scss'

interface Props {
  loependeVedtak: LoependeVedtak
  isCentered?: boolean
}

export const InfoOmFremtidigVedtak = ({
  loependeVedtak,
  isCentered,
}: Props) => {
  // Vis hvis fremtidig vedtak uten gjeldende vedtak
  if (!loependeVedtak.fremtidigAlderspensjon || loependeVedtak.alderspensjon)
    return null

  return (
    <Alert
      className={clsx(styles.alert, { [styles.alert__centered]: isCentered })}
      variant="info"
      data-intl="stegvisning.fremtidigvedtak.alert"
    >
      <FormattedMessage
        id="stegvisning.fremtidigvedtak.alert"
        values={{
          grad: loependeVedtak.fremtidigAlderspensjon.grad,
          fom: format(
            parseISO(loependeVedtak.fremtidigAlderspensjon.fom),
            DATE_ENDUSER_FORMAT
          ),
        }}
      />
    </Alert>
  )
}
