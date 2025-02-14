import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong } from '@navikt/ds-react'

import { ReadMore } from '@/components/common/ReadMore'
import { useAppSelector } from '@/state/hooks'
import { selectNormertPensjonsalder } from '@/state/userInput/selectors'
import { formatUttaksalder } from '@/utils/alder'
import { getFormatMessageValues } from '@/utils/translations'

interface Props {
  ufoeregrad: number
  isEndring: boolean
}
export const ReadMoreOmPensjonsalder: React.FC<Props> = ({
  ufoeregrad,
  isEndring,
}) => {
  const intl = useIntl()
  const normertPensjonsalder = useAppSelector(selectNormertPensjonsalder)
  const formatertNormertPensjonsalder = formatUttaksalder(
    intl,
    normertPensjonsalder
  )

  return (
    <ReadMore
      name="Om pensjonsalder avansert"
      header={intl.formatMessage({
        id: ufoeregrad
          ? 'omufoeretrygd.readmore.title'
          : 'beregning.read_more.pensjonsalder.label',
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
              normertPensjonsalder: formatertNormertPensjonsalder,
            }}
          />
        </BodyLong>
      ) : (
        <>
          <BodyLong>
            <FormattedMessage
              id={
                isEndring
                  ? 'beregning.read_more.pensjonsalder.endring.body'
                  : 'beregning.read_more.pensjonsalder.body'
              }
              values={{
                ...getFormatMessageValues(intl),
                normertPensjonsalder: formatertNormertPensjonsalder,
              }}
            />
          </BodyLong>
        </>
      )}
    </ReadMore>
  )
}
