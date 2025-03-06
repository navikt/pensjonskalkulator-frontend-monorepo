import { FormattedMessage } from 'react-intl'

import { Heading, BodyLong } from '@navikt/ds-react'
import { format, parse } from 'date-fns'

import { Divider } from '@/components/common/Divider'
import { useAppSelector } from '@/state/hooks'
import {
  selectIsEndring,
  selectLoependeVedtak,
} from '@/state/userInput/selectors'
import { DATE_BACKEND_FORMAT, DATE_ENDUSER_FORMAT } from '@/utils/dates'

export const AvansertSkjemaIntroEndring = () => {
  const isEndring = useAppSelector(selectIsEndring)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)

  if (isEndring) {
    return (
      <>
        <Heading level="2" size="medium">
          <FormattedMessage id={'beregning.endring.rediger.title'} />
        </Heading>

        <BodyLong>
          <FormattedMessage
            id={'beregning.endring.rediger.vedtak_status'}
            values={{
              dato: format(
                parse(
                  loependeVedtak?.alderspensjon?.fom as string,
                  DATE_BACKEND_FORMAT,
                  new Date()
                ),
                DATE_ENDUSER_FORMAT
              ),
              grad: loependeVedtak?.alderspensjon?.grad,
            }}
          />
        </BodyLong>

        <Divider />
      </>
    )
  }

  return null
}
