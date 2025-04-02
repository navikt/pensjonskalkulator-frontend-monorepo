import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong } from '@navikt/ds-react'
import clsx from 'clsx'
import { format, parse } from 'date-fns'
import { nb, nn, enGB } from 'date-fns/locale'

import { Divider } from '@/components/common/Divider'
import { DATE_BACKEND_FORMAT } from '@/utils/dates'
import { formatInntekt } from '@/utils/inntekt'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './InfoOmLoependeVedtak.module.scss'

interface Props {
  loependeVedtak?: LoependeVedtak
}

export const InfoOmLoependeVedtak = ({ loependeVedtak }: Props) => {
  const intl = useIntl()

  const formatertMaaned = React.useMemo(() => {
    if (
      !loependeVedtak ||
      !loependeVedtak.alderspensjon ||
      !loependeVedtak.alderspensjon.sisteUtbetaling
    ) {
      return ''
    }
    return format(
      parse(
        loependeVedtak.alderspensjon.sisteUtbetaling.utbetalingsdato,
        DATE_BACKEND_FORMAT,
        new Date()
      ),
      'LLLL',
      {
        locale:
          (intl.locale as Locales) === 'en'
            ? enGB
            : (intl.locale as Locales) === 'nn'
              ? nn
              : nb,
      }
    )
  }, [loependeVedtak])

  if (!loependeVedtak || !loependeVedtak?.alderspensjon) {
    return null
  }

  return (
    <div className={clsx(styles.container, styles.container__hasMobilePadding)}>
      <BodyLong>
        <FormattedMessage
          id="beregning.endring.rediger.vedtak_grad_status"
          values={{
            ...getFormatMessageValues(),
            grad: loependeVedtak?.alderspensjon?.grad,
          }}
        />
        {loependeVedtak.alderspensjon.grad > 0 &&
          loependeVedtak.alderspensjon.sisteUtbetaling && (
            <FormattedMessage
              id="beregning.endring.rediger.vedtak_betaling_status"
              values={{
                ...getFormatMessageValues(),
                maaned: formatertMaaned,
                beloep: formatInntekt(
                  loependeVedtak.alderspensjon.sisteUtbetaling.beloep
                ),
              }}
            />
          )}
      </BodyLong>
      <Divider smallMargin />
    </div>
  )
}
