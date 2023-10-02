import { useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Heading } from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { formatMessageValues } from '@/utils/translations'

export function Personopplysninger() {
  const intl = useIntl()

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.personopplysninger',
    })
  }, [])

  return (
    <Card hasLargePadding hasMargin>
      <Heading level="2" size="medium" spacing>
        <FormattedMessage id="personopplysninger.header" />
      </Heading>
      <section>
        <Heading level="3" size="small" spacing>
          <FormattedMessage id="personopplysninger.section.formaal.header" />
        </Heading>

        <BodyLong spacing>
          <FormattedMessage id="personopplysninger.section.formaal.1" />
        </BodyLong>

        <BodyLong spacing>
          <FormattedMessage id="personopplysninger.section.formaal.2" />
        </BodyLong>
      </section>
      <section>
        <Heading level="3" size="small" spacing>
          <FormattedMessage id="personopplysninger.section.hvordan_brukes.header" />
        </Heading>

        <BodyLong spacing>
          <FormattedMessage id="personopplysninger.section.hvordan_brukes.1" />
        </BodyLong>

        <BodyLong spacing>
          <FormattedMessage id="personopplysninger.section.hvordan_brukes.2" />
        </BodyLong>

        <BodyLong spacing>
          <FormattedMessage id="personopplysninger.section.hvordan_brukes.3" />
        </BodyLong>
      </section>
      <section>
        <Heading level="3" size="small" spacing>
          <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.header" />
        </Heading>

        <Heading level="4" size="xsmall" spacing>
          <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.header" />
        </Heading>

        <ul>
          <li>
            <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.1" />
          </li>
          <li>
            <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.2" />
          </li>
          <li>
            <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.3" />
          </li>
          <li>
            <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.4" />
          </li>
          <li>
            <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.5" />
          </li>
          <li>
            <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.6" />
          </li>
          <li>
            <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.7" />
          </li>
          <li>
            <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.8" />
          </li>
          <li>
            <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.9" />
          </li>
          <li>
            <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.10" />
          </li>
        </ul>

        <Heading level="4" size="xsmall" spacing>
          <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.gpdr.list.header" />
        </Heading>

        <ul>
          <li>
            <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.gpdr.list.1" />
          </li>
          <li>
            <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.gpdr.list.2" />
          </li>
        </ul>
        <BodyLong spacing>
          <FormattedMessage id="personopplysninger.section.hvilke_opplysninger.gpdr.list.subtext" />
        </BodyLong>
      </section>

      <section>
        <Heading level="3" size="small" spacing>
          <FormattedMessage id="personopplysninger.section.lagring.heading" />
        </Heading>

        <BodyLong spacing>
          <FormattedMessage id="personopplysninger.section.lagring.text" />
        </BodyLong>
      </section>

      <section>
        <Heading level="3" size="small" spacing>
          <FormattedMessage id="personopplysninger.section.informasjon_om_rettighetene.heading" />
        </Heading>

        <BodyLong spacing>
          <FormattedMessage
            id="personopplysninger.section.informasjon_om_rettighetene.text"
            values={{
              ...formatMessageValues,
            }}
          />
        </BodyLong>
      </section>

      <section>
        <Heading level="3" size="small" spacing>
          <FormattedMessage id="personopplysninger.section.spoersmaal.heading" />
        </Heading>

        <BodyLong spacing>
          <FormattedMessage
            id="personopplysninger.section.spoersmaal.text"
            values={{
              ...formatMessageValues,
            }}
          />
        </BodyLong>
      </section>
    </Card>
  )
}
