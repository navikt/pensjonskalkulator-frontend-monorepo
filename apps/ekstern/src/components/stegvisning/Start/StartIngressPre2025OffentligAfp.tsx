import React from 'react'
import { FormattedMessage } from 'react-intl'

import { BodyLong } from '@navikt/ds-react'

import { getFormatMessageValues } from '@/utils/translations'

export interface StartIngressPre2025OffentligAfpProps {
  loependeVedtak: LoependeVedtak
}

export const StartIngressPre2025OffentligAfp: React.FC<
  StartIngressPre2025OffentligAfpProps
> = ({ loependeVedtak }) => (
  <div>
    <span data-testid="stegvisning-start-ingress-pre2025-offentlig-afp">
      {loependeVedtak.alderspensjon?.grad === 0 ? (
        <FormattedMessage
          id="stegvisning.start.endring.ingress.pre2025_offentlig_afp"
          values={{
            ...getFormatMessageValues(),
            grad: loependeVedtak?.alderspensjon?.grad,
          }}
        />
      ) : (
        <FormattedMessage
          id="stegvisning.start.ingress.pre2025_offentlig_afp"
          values={{ ...getFormatMessageValues() }}
        />
      )}
    </span>
    <BodyLong size="medium">
      <FormattedMessage id="stegvisning.start.ingress_2" />
    </BodyLong>
  </div>
)
