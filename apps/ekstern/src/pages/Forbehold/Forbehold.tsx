import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'

import { BodyLong, Heading } from '@navikt/ds-react'
import { PortableText } from '@portabletext/react'

import { Card } from '@/components/common/Card'
import { SanityContext } from '@/context/SanityContext'
import { getSanityPortableTextComponents } from '@/utils/sanity'

export function Forbehold() {
  const intl = useIntl()
  const { forbeholdAvsnittData } = React.useContext(SanityContext)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.forbehold',
    })
  }, [])

  return (
    <Card hasLargePadding hasMargin>
      <Heading level="2" size="medium" spacing>
        <FormattedMessage id="forbehold.title" />
      </Heading>
      <>
        {forbeholdAvsnittData.map((forbeholdAvsnitt, i) => {
          return forbeholdAvsnitt.overskrift ? (
            <section key={i}>
              <Heading level="3" size="small" spacing>
                {forbeholdAvsnitt.overskrift}
              </Heading>
              <BodyLong spacing as="div">
                <PortableText
                  value={forbeholdAvsnitt.innhold}
                  components={{ ...getSanityPortableTextComponents(intl) }}
                />
              </BodyLong>
            </section>
          ) : (
            <BodyLong spacing as="div">
              <PortableText
                key={i}
                value={forbeholdAvsnitt.innhold}
                components={{ ...getSanityPortableTextComponents(intl) }}
              />
            </BodyLong>
          )
        })}
      </>
    </Card>
  )
}
