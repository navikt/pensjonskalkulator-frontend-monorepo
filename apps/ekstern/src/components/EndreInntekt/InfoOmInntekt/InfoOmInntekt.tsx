import { FormattedMessage } from 'react-intl'

import { BodyLong, Label } from '@navikt/ds-react'

import { getFormatMessageValues } from '@/utils/translations'

export const InfoOmInntekt = () => {
  return (
    <>
      <BodyLong>
        <FormattedMessage
          id="inntekt.info_om_inntekt.intro"
          values={{
            ...getFormatMessageValues(),
          }}
        />
      </BodyLong>
      <Label as="h2">
        <FormattedMessage id="inntekt.info_om_inntekt.subtitle_1" />
      </Label>
      <ul data-testid="info-om-inntekt-list">
        <li>
          <FormattedMessage id="inntekt.info_om_inntekt.list_item1" />
        </li>
        <li>
          <FormattedMessage id="inntekt.info_om_inntekt.list_item2" />
        </li>
        <li>
          <FormattedMessage id="inntekt.info_om_inntekt.list_item3" />
        </li>
        <li>
          <FormattedMessage id="inntekt.info_om_inntekt.list_item4" />
        </li>
        <li>
          <FormattedMessage id="inntekt.info_om_inntekt.list_item5" />
        </li>
        <li>
          <FormattedMessage id="inntekt.info_om_inntekt.list_item6" />
        </li>
        <li>
          <FormattedMessage id="inntekt.info_om_inntekt.list_item7" />
        </li>
        <li>
          <FormattedMessage id="inntekt.info_om_inntekt.list_item8" />
        </li>
        <li>
          <FormattedMessage id="inntekt.info_om_inntekt.list_item9" />
        </li>
      </ul>
      <Label as="h2">
        <FormattedMessage id="inntekt.info_om_inntekt.subtitle_2" />
      </Label>
      <ul>
        <li>
          <FormattedMessage id="inntekt.info_om_inntekt.ikke_inntekt.list_item1" />
        </li>
        <li>
          <FormattedMessage id="inntekt.info_om_inntekt.ikke_inntekt.list_item2" />
        </li>
        <li>
          <FormattedMessage id="inntekt.info_om_inntekt.ikke_inntekt.list_item3" />
        </li>
        <li>
          <FormattedMessage id="inntekt.info_om_inntekt.ikke_inntekt.list_item4" />
        </li>
      </ul>
      <BodyLong>
        <FormattedMessage
          id="inntekt.info_om_inntekt.ingress"
          values={{
            ...getFormatMessageValues(),
          }}
        />
      </BodyLong>
    </>
  )
}
