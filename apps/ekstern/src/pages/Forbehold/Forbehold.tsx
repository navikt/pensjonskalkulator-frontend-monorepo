import { useEffect } from 'react'
import { useIntl, FormattedMessage } from 'react-intl'

import { BodyLong, Heading } from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { formatMessageValues } from '@/utils/translations'

import styles from './Forbehold.module.scss'

export function Forbehold() {
  const intl = useIntl()

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.forbehold',
    })
  }, [])

  return (
    <Card hasLargePadding hasMargin>
      <Heading className={styles.heading2} level="2" size="medium">
        <FormattedMessage id="forbehold.title" />
      </Heading>
      <BodyLong>
        <FormattedMessage
          id="forbehold.intro"
          values={{
            ...formatMessageValues,
          }}
        />
      </BodyLong>
      <Heading className={styles.heading3} level="3" size="small">
        <FormattedMessage id="forbehold.inntekt.title" />
      </Heading>
      <BodyLong>
        <FormattedMessage
          id="forbehold.inntekt.ingress"
          values={{
            ...formatMessageValues,
          }}
        />
      </BodyLong>
      <Heading className={styles.heading3} level="3" size="small">
        <FormattedMessage id="forbehold.utenlandsopphold.title" />
      </Heading>
      <BodyLong>
        <FormattedMessage
          id="forbehold.utenlandsopphold.ingress"
          values={{
            ...formatMessageValues,
          }}
        />
      </BodyLong>
      <Heading className={styles.heading3} level="3" size="small">
        <FormattedMessage id="forbehold.sivilstand.title" />
      </Heading>
      <BodyLong>
        <FormattedMessage
          id="forbehold.sivilstand.ingress"
          values={{
            ...formatMessageValues,
          }}
        />
      </BodyLong>
      <Heading className={styles.heading3} level="3" size="small">
        <FormattedMessage id="forbehold.afp_privat.title" />
      </Heading>
      <BodyLong>
        <FormattedMessage
          id="forbehold.afp_privat.ingress"
          values={{
            ...formatMessageValues,
          }}
        />
      </BodyLong>
      <Heading className={styles.heading3} level="3" size="small">
        <FormattedMessage id="forbehold.afp_offentlig.title" />
      </Heading>
      <BodyLong>
        <FormattedMessage
          id="forbehold.afp_offentlig.ingress"
          values={{
            ...formatMessageValues,
          }}
        />
      </BodyLong>
      <Heading className={styles.heading3} level="3" size="small">
        <FormattedMessage id="forbehold.uforetrygd.title" />
      </Heading>
      <BodyLong>
        <FormattedMessage
          id="forbehold.uforetrygd.ingress"
          values={{
            ...formatMessageValues,
          }}
        />
      </BodyLong>
      <Heading className={styles.heading3} level="3" size="small">
        <FormattedMessage id="forbehold.gjenlevende.title" />
      </Heading>
      <BodyLong>
        <FormattedMessage
          id="forbehold.gjenlevende.ingress"
          values={{
            ...formatMessageValues,
          }}
        />
      </BodyLong>
      <Heading className={styles.heading3} level="3" size="small">
        <FormattedMessage id="forbehold.saeralder.title" />
      </Heading>
      <BodyLong>
        <FormattedMessage
          id="forbehold.saeralder.ingress"
          values={{
            ...formatMessageValues,
          }}
        />
      </BodyLong>
      <Heading className={styles.heading3} level="3" size="small">
        <FormattedMessage id="forbehold.pensjonsavtaler.title" />
      </Heading>
      <BodyLong>
        <FormattedMessage
          id="forbehold.pensjonsavtaler.ingress"
          values={{
            ...formatMessageValues,
          }}
        />
      </BodyLong>
    </Card>
  )
}
