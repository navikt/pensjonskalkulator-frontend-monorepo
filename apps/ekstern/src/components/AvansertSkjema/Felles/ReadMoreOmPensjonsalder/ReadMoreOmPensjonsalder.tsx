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

// PEK-1026 - Denne komponenten fases sannsynligvis ut etter at logikken med ufoeretrygd er splittet
export const ReadMoreOmPensjonsalder = ({ ufoeregrad, isEndring }: Props) => {
  const intl = useIntl()
  const normertPensjonsalder = useAppSelector(selectNormertPensjonsalder)
  const formatertNormertPensjonsalder = formatUttaksalder(
    intl,
    normertPensjonsalder
  )

  let messageId = 'beregning.read_more.pensjonsalder.body'
  if (ufoeregrad) {
    messageId =
      ufoeregrad === 100
        ? 'omufoeretrygd.readmore.hel.ingress'
        : 'omufoeretrygd.readmore.gradert.avansert.ingress'
  } else if (isEndring) {
    messageId = 'beregning.read_more.pensjonsalder.endring.body'
  }

  return (
    <ReadMore
      name="Om pensjonsalder avansert"
      header={intl.formatMessage({
        id: ufoeregrad
          ? 'omufoeretrygd.readmore.title'
          : 'beregning.read_more.pensjonsalder.label',
      })}
    >
      <BodyLong>
        <FormattedMessage
          id={messageId}
          values={{
            ...getFormatMessageValues(),
            normertPensjonsalder: formatertNormertPensjonsalder,
          }}
        />
      </BodyLong>
    </ReadMore>
  )
}
