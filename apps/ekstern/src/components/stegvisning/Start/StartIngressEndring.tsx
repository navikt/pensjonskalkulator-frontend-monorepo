import { format, parseISO } from 'date-fns'
import { FormattedMessage } from 'react-intl'

import { BodyLong } from '@navikt/ds-react'

import { TelefonLink } from '@/components/common/TelefonLink'
import { DATE_ENDUSER_FORMAT } from '@/utils/dates'
import { getFormatMessageValues } from '@/utils/translations'

interface Props {
  loependeVedtak: LoependeVedtak
}

export function StartIngressEndring({ loependeVedtak }: Props) {
  const fremtidigAlderspensjon = loependeVedtak.fremtidigAlderspensjon
  return (
    <>
      <BodyLong size="large" data-testid="stegvisning-start-ingress-endring">
        <FormattedMessage
          id="stegvisning.start.endring.ingress_1a"
          values={{
            ...getFormatMessageValues(),
            grad: loependeVedtak.alderspensjon?.grad,
            ufoeretrygd: loependeVedtak.ufoeretrygd.grad,
            afpPrivat: !!loependeVedtak.afpPrivat,
            afpOffentlig: !!loependeVedtak.afpOffentlig,
          }}
        />
        {fremtidigAlderspensjon ? (
          <FormattedMessage
            data-testid="stegvisning-start-ingress-endring-fremtidig"
            id="stegvisning.start.endring.ingress_1b.med_fremtidig"
            values={{
              ...getFormatMessageValues(),
              grad: fremtidigAlderspensjon.grad,
              fom: format(
                parseISO(fremtidigAlderspensjon.fom),
                DATE_ENDUSER_FORMAT
              ),
              link: <TelefonLink />,
            }}
          />
        ) : (
          <FormattedMessage
            id="stegvisning.start.endring.ingress_1b.uten_fremtidig"
            values={getFormatMessageValues()}
          />
        )}
      </BodyLong>

      {!fremtidigAlderspensjon && (
        <BodyLong
          size="medium"
          data-testid="stegvisning-start-ingress-endring-info"
        >
          <FormattedMessage id="stegvisning.start.endring.ingress_2" />
        </BodyLong>
      )}
    </>
  )
}
