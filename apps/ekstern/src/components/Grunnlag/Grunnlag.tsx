import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Accordion, BodyLong, Heading } from '@navikt/ds-react'

import { AccordionItem } from '@/components/common/AccordionItem'
import { formatUttaksalder } from '@/components/VelgUttaksalder/utils'
import { useGetPersonQuery } from '@/state/api/apiSlice'
import { useAppSelector } from '@/state/hooks'
import { selectAfp, selectSamboer } from '@/state/userInput/selectors'
import { formatAfp } from '@/utils/afp'
import { formatAsDecimal } from '@/utils/currency'
import { formatSivilstand } from '@/utils/sivilstand'
import { formatMessageValues } from '@/utils/translations'

import { GrunnlagPensjonsavtaler } from './GrunnlagPensjonsavtaler'
import { GrunnlagSection } from './GrunnlagSection'

import styles from './Grunnlag.module.scss'
interface Props {
  tidligstMuligUttak?: Uttaksalder | UttaksalderForenklet
}

// TODO koble inntekt
export const Grunnlag: React.FC<Props> = ({ tidligstMuligUttak }) => {
  const intl = useIntl()
  const { data: person, isSuccess } = useGetPersonQuery()
  const afp = useAppSelector(selectAfp)
  const harSamboer = useAppSelector(selectSamboer)

  const formatertAfp = React.useMemo(() => formatAfp(afp ?? 'vet_ikke'), [afp])

  const formatertSivilstand = React.useMemo(() => {
    const a = person ? formatSivilstand(person.sivilstand) : ''
    return `${a}, ${harSamboer ? 'med' : 'uten'} samboer`
  }, [person])

  return (
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
        <AccordionItem name="Grunnlag: Tidligst mulig uttak">
          <GrunnlagSection
            headerTitle={intl.formatMessage({
              id: 'grunnlag.tidligstmuliguttak.title',
            })}
            headerValue={
              tidligstMuligUttak
                ? formatUttaksalder(tidligstMuligUttak, { compact: true })
                : intl.formatMessage({
                    id: 'grunnlag.tidligstmuliguttak.title.error',
                  })
            }
          >
            <>
              {!tidligstMuligUttak && (
                <BodyLong>
                  <FormattedMessage
                    id="grunnlag.tidligstmuliguttak.ingress.error"
                    values={{
                      ...formatMessageValues,
                    }}
                  />
                </BodyLong>
              )}
              <BodyLong>
                <FormattedMessage
                  id="grunnlag.tidligstmuliguttak.ingress"
                  values={{
                    ...formatMessageValues,
                  }}
                />
              </BodyLong>
            </>
          </GrunnlagSection>
        </AccordionItem>
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
        <AccordionItem name="Grunnlag: Inntekt">
          <GrunnlagSection
            headerTitle={intl.formatMessage({
              id: 'grunnlag.inntekt.title',
            })}
            headerValue={`${formatAsDecimal(0)} kr`}
          >
            <BodyLong>
              <FormattedMessage
                id="grunnlag.inntekt.ingress"
                values={{
                  ...formatMessageValues,
                  aarsinntekt: '0000',
                }}
              />
            </BodyLong>
          </GrunnlagSection>
        </AccordionItem>
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
            headerValue="Minst 40 år"
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
            headerValue="Folketrygden (NAV)"
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
  )
}
