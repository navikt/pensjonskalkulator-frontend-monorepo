import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'

import { BodyLong, Heading } from '@navikt/ds-react'
import { PortableText } from '@portabletext/react'

import { Card } from '@/components/common/Card'
import { SanityContext } from '@/context/SanityContext'
import { SanityForbeholdAvsnitt } from '@/context/SanityContext/SanityTypes'
import { useGetPersonQuery } from '@/state/api/apiSlice'
import { useGetSanityFeatureToggleQuery } from '@/state/api/apiSlice'
import { transformAlderToString } from '@/utils/alder'
import { getSanityPortableTextComponents } from '@/utils/sanity'
import { getFormatMessageValues } from '@/utils/translations'

export function Forbehold() {
  const intl = useIntl()
  const { data: sanityFeatureToggle } = useGetSanityFeatureToggleQuery()
  const { forbeholdAvsnittData } = React.useContext(SanityContext)

  const { data: person } = useGetPersonQuery()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.forbehold',
    })
  }, [])

  const sortertForbeholdAvsnittData = React.useMemo(() => {
    return forbeholdAvsnittData.sort(
      (a: SanityForbeholdAvsnitt, b: SanityForbeholdAvsnitt) => {
        return a.order - b.order
      }
    )
  }, [forbeholdAvsnittData])

  return (
    <Card hasLargePadding hasMargin>
      <Heading level="2" size="medium" spacing>
        <FormattedMessage id="forbehold.title" />
      </Heading>

      {sanityFeatureToggle?.enabled &&
      sortertForbeholdAvsnittData.length > 0 ? (
        <>
          {sortertForbeholdAvsnittData.map((forbeholdAvsnitt, i) => {
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
      ) : (
        <>
          <BodyLong spacing>
            <FormattedMessage
              id="forbehold.intro"
              values={{
                ...getFormatMessageValues(intl),
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
                  ...getFormatMessageValues(intl),
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
                  ...getFormatMessageValues(intl),
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
                  ...getFormatMessageValues(intl),
                }}
              />
            </BodyLong>
          </section>
          <section>
            <Heading level="3" size="small" spacing>
              <FormattedMessage id="forbehold.afp.title" />
            </Heading>
            <BodyLong spacing>
              <FormattedMessage
                id="forbehold.afp.ingress"
                values={{
                  ...getFormatMessageValues(intl),
                }}
              />
            </BodyLong>
          </section>
          {person?.pensjoneringAldre.normertPensjoneringsalder && (
            <section>
              <Heading level="3" size="small" spacing>
                <FormattedMessage id="forbehold.uforetrygd.title" />
              </Heading>
              <BodyLong spacing>
                <FormattedMessage
                  id="forbehold.uforetrygd.ingress"
                  values={{
                    ...getFormatMessageValues(intl),
                    normertPensjonsalder: transformAlderToString(
                      intl.formatMessage,
                      person?.pensjoneringAldre.normertPensjoneringsalder
                    ),
                  }}
                />
              </BodyLong>
            </section>
          )}
          <section>
            <Heading level="3" size="small" spacing>
              <FormattedMessage id="forbehold.uforetrygd_afp.title" />
            </Heading>
            <BodyLong spacing>
              <FormattedMessage
                id="forbehold.uforetrygd_afp.ingress"
                values={{
                  ...getFormatMessageValues(intl),
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
                  ...getFormatMessageValues(intl),
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
                  ...getFormatMessageValues(intl),
                }}
              />
            </BodyLong>
          </section>
        </>
      )}
    </Card>
  )
}
