import { IntlShape } from 'react-intl'

import { pdfFormatMessageValues } from './utils'

export const getUttaksGradEndringIngress = ({
  prosent,
  intl,
}: {
  prosent: number
  intl: IntlShape
}): string => {
  return `<p style="margin-top: 0.5em;">${intl.formatMessage({ id: 'beregning.endring.rediger.vedtak_grad_status' }, { ...pdfFormatMessageValues, grad: prosent })}</p>`
}
