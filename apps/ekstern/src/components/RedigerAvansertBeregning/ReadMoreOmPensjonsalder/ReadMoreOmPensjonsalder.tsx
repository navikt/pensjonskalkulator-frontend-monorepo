import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Label } from '@navikt/ds-react'

import { ReadMore } from '@/components/common/ReadMore'
import { getFormatMessageValues } from '@/utils/translations'

interface Props {
  ufoeregrad: number
}
export const ReadMoreOmPensjonsalder: React.FC<Props> = ({ ufoeregrad }) => {
  const intl = useIntl()

  return (
    <ReadMore
      name="Om pensjonsalder avansert"
      header={intl.formatMessage({
        id: ufoeregrad
          ? 'omufoeretrygd.readmore.title'
          : 'beregning.avansert.rediger.read_more.pensjonsalder.label',
      })}
    >
      {ufoeregrad ? (
        <BodyLong>
          <FormattedMessage
            id={
              ufoeregrad === 100
                ? 'omufoeretrygd.readmore.hel.ingress'
                : 'omufoeretrygd.readmore.gradert.avansert.ingress'
            }
            values={{
              ...getFormatMessageValues(intl),
            }}
          />
        </BodyLong>
      ) : (
        <>
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
        </>
      )}
    </ReadMore>
  )
}
