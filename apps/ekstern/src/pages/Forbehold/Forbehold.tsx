import { useEffect } from 'react'
import { useIntl, FormattedMessage } from 'react-intl'

import { BodyLong, Heading } from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { formatMessageValues } from '@/utils/translations'

export function Forbehold() {
  const intl = useIntl()

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.forbehold',
    })
  }, [])

  return (
    <Card hasLargePadding hasMargin>
      <Heading level="2" size="medium" spacing>
        <FormattedMessage id="forbehold.title" />
      </Heading>
      <BodyLong spacing>
        <FormattedMessage
          id="forbehold.intro"
          values={{
            ...formatMessageValues,
          }}
        />
      </BodyLong>
      <section>
        <Heading level="3" size="small" spacing>
          <FormattedMessage id="forbehold.inntekt.title" />
        </Heading>
        <BodyLong spacing>
          <FormattedMessage
            id="forbehold.inntekt.ingress"
            values={{
              ...formatMessageValues,
            }}
          />
        </BodyLong>
      </section>
      <section>
        <Heading level="3" size="small" spacing>
          <FormattedMessage id="forbehold.utenlandsopphold.title" />
        </Heading>
        <BodyLong spacing>
          <FormattedMessage
            id="forbehold.utenlandsopphold.ingress"
            values={{
              ...formatMessageValues,
            }}
          />
        </BodyLong>
      </section>
      <section>
        <Heading level="3" size="small" spacing>
          <FormattedMessage id="forbehold.sivilstand.title" />
        </Heading>
        <BodyLong spacing>
          <FormattedMessage
            id="forbehold.sivilstand.ingress"
            values={{
              ...formatMessageValues,
            }}
          />
        </BodyLong>
      </section>
      <section>
        <Heading level="3" size="small" spacing>
          <FormattedMessage id="forbehold.afp_privat.title" />
        </Heading>
        <BodyLong spacing>
          <FormattedMessage
            id="forbehold.afp_privat.ingress"
            values={{
              ...formatMessageValues,
            }}
          />
        </BodyLong>
      </section>
      <section>
        <Heading level="3" size="small" spacing>
          <FormattedMessage id="forbehold.afp_offentlig.title" />
        </Heading>
        <BodyLong spacing>
          <FormattedMessage
            id="forbehold.afp_offentlig.ingress"
            values={{
              ...formatMessageValues,
            }}
          />
        </BodyLong>
      </section>
      <section>
        <Heading level="3" size="small" spacing>
          <FormattedMessage id="forbehold.uforetrygd.title" />
        </Heading>
        <BodyLong spacing>
          <FormattedMessage
            id="forbehold.uforetrygd.ingress"
            values={{
              ...formatMessageValues,
            }}
          />
        </BodyLong>
      </section>
      <section>
        <Heading level="3" size="small" spacing>
          <FormattedMessage id="forbehold.gjenlevende.title" />
        </Heading>
        <BodyLong spacing>
          <FormattedMessage
            id="forbehold.gjenlevende.ingress"
            values={{
              ...formatMessageValues,
            }}
          />
        </BodyLong>
      </section>
      <section>
        <Heading level="3" size="small" spacing>
          <FormattedMessage id="forbehold.saeralder.title" />
        </Heading>
        <BodyLong spacing>
          <FormattedMessage
            id="forbehold.saeralder.ingress"
            values={{
              ...formatMessageValues,
            }}
          />
        </BodyLong>
      </section>
      <section>
        <Heading level="3" size="small" spacing>
          <FormattedMessage id="forbehold.pensjonsavtaler.title" />
        </Heading>
        <BodyLong spacing>
          <FormattedMessage
            id="forbehold.pensjonsavtaler.ingress"
            values={{
              ...formatMessageValues,
            }}
          />
        </BodyLong>
      </section>
    </Card>
  )
}
