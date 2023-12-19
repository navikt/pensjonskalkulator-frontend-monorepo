import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Accordion, BodyLong, Heading } from '@navikt/ds-react'

import { AccordionItem } from '@/components/common/AccordionItem'
import { useGetPersonQuery } from '@/state/api/apiSlice'
import { useAppSelector } from '@/state/hooks'
import { selectAfp, selectSamboer } from '@/state/userInput/selectors'
import { formatAfp } from '@/utils/afp'
import { formatSivilstand } from '@/utils/sivilstand'
import { formatMessageValues } from '@/utils/translations'

import { GrunnlagForbehold } from './GrunnlagForbehold'
import { GrunnlagInntekt } from './GrunnlagInntekt'
import { GrunnlagPensjonsavtaler } from './GrunnlagPensjonsavtaler'
import { GrunnlagSection } from './GrunnlagSection'

import styles from './Grunnlag.module.scss'

export const Grunnlag: React.FC = () => {
  const intl = useIntl()

  const { data: person, isSuccess } = useGetPersonQuery()
  const afp = useAppSelector(selectAfp)
  const harSamboer = useAppSelector(selectSamboer)

  const formatertAfp = React.useMemo(
    () => formatAfp(intl, afp ?? 'vet_ikke'),
    [afp]
  )

  const formatertSivilstand = React.useMemo(
    () =>
      person
        ? formatSivilstand(intl, person.sivilstand, {
            harSamboer: !!harSamboer,
          })
        : '',

    [person]
  )

  return (
    <>
      <section className={styles.section}>
        <div className={styles.description}>
          <Heading level="2" size="medium">
            <FormattedMessage id="grunnlag.title" />
          </Heading>
          <BodyLong>
            <FormattedMessage id="grunnlag.ingress" />
          </BodyLong>
        </div>
        <Accordion>
          <AccordionItem name="Grunnlag: Uttaksgrad">
            <GrunnlagSection
              headerTitle={intl.formatMessage({
                id: 'grunnlag.uttaksgrad.title',
              })}
              headerValue="100 %"
            >
              <BodyLong>
                <FormattedMessage
                  id="grunnlag.uttaksgrad.ingress"
                  values={{
                    ...formatMessageValues,
                  }}
                />
              </BodyLong>
            </GrunnlagSection>
          </AccordionItem>
          <GrunnlagInntekt />
          <AccordionItem name="Gunnlag: Sivilstand">
            <GrunnlagSection
              headerTitle={intl.formatMessage({
                id: 'grunnlag.sivilstand.title',
              })}
              headerValue={
                isSuccess
                  ? formatertSivilstand
                  : intl.formatMessage({
                      id: 'grunnlag.sivilstand.title.error',
                    })
              }
            >
              <BodyLong>
                <FormattedMessage
                  id="grunnlag.sivilstand.ingress"
                  values={{
                    ...formatMessageValues,
                  }}
                />
              </BodyLong>
            </GrunnlagSection>
          </AccordionItem>
          <AccordionItem name="Grunnlag: Utenlandsopphold">
            <GrunnlagSection
              headerTitle={intl.formatMessage({
                id: 'grunnlag.opphold.title',
              })}
              headerValue={intl.formatMessage({
                id: 'grunnlag.opphold.value',
              })}
            >
              <BodyLong>
                <FormattedMessage
                  id="grunnlag.opphold.ingress"
                  values={{
                    ...formatMessageValues,
                  }}
                />
              </BodyLong>
            </GrunnlagSection>
          </AccordionItem>
          <AccordionItem name="Grunnlag: Alderspensjon (NAV)">
            <GrunnlagSection
              headerTitle={intl.formatMessage({
                id: 'grunnlag.alderspensjon.title',
              })}
              headerValue={intl.formatMessage({
                id: 'grunnlag.alderspensjon.value',
              })}
            >
              <BodyLong>
                <FormattedMessage
                  id="grunnlag.alderspensjon.ingress"
                  values={{
                    ...formatMessageValues,
                  }}
                />
              </BodyLong>
            </GrunnlagSection>
          </AccordionItem>
          <AccordionItem name="Grunnlag: AFP">
            <GrunnlagSection
              headerTitle={intl.formatMessage({
                id: 'grunnlag.afp.title',
              })}
              headerValue={formatertAfp}
            >
              <BodyLong>
                <FormattedMessage
                  id={`grunnlag.afp.ingress.${afp}`}
                  values={{
                    ...formatMessageValues,
                  }}
                />
              </BodyLong>
            </GrunnlagSection>
          </AccordionItem>
          <GrunnlagPensjonsavtaler />
        </Accordion>
      </section>
      <GrunnlagForbehold />
    </>
  )
}
