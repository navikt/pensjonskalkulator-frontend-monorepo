import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Label } from '@navikt/ds-react'

import { ReadMore } from '@/components/common/ReadMore'
import { getFormatMessageValues } from '@/utils/translations'

export const ReadMoreOmPensjonsalder = () => {
  const intl = useIntl()

  return (
    <ReadMore
      name="Om pensjonsalder"
      header={intl.formatMessage({
        id: 'beregning.avansert.rediger.read_more.pensjonsalder.label',
      })}
    >
      <BodyLong>
        <FormattedMessage
          id="beregning.avansert.rediger.read_more.pensjonsalder.intro"
          values={{
            ...getFormatMessageValues(intl),
          }}
        />
      </BodyLong>
      <Label as="h3">
        <FormattedMessage id="beregning.avansert.rediger.read_more.pensjonsalder.subtitle" />
      </Label>
      <FormattedMessage
        id="beregning.avansert.rediger.read_more.pensjonsalder.body"
        values={{
          ...getFormatMessageValues(intl),
        }}
      />
    </ReadMore>
  )
}
