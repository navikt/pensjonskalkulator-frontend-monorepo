import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Accordion, BodyLong, Heading, Link } from '@navikt/ds-react'

import { AccordionItem } from '@/components/common/AccordionItem'
import { paths } from '@/router/constants'
import { useGetPersonQuery } from '@/state/api/apiSlice'
import { useAppSelector } from '@/state/hooks'
import { selectAfp, selectSamboer } from '@/state/userInput/selectors'
import { BeregningVisning } from '@/types/common-types'
import { formatAfp } from '@/utils/afp'
import { formatSivilstand } from '@/utils/sivilstand'
import { getFormatMessageValues } from '@/utils/translations'

import { GrunnlagForbehold } from './GrunnlagForbehold'
import { GrunnlagInntekt } from './GrunnlagInntekt'
import { GrunnlagSection } from './GrunnlagSection'

import styles from './Grunnlag.module.scss'

interface IProps {
  visning: BeregningVisning
}

export const Grunnlag: React.FC<IProps> = ({ visning }) => {
  const navigate = useNavigate()

  const goToAvansert: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault()
    navigate(paths.beregningDetaljert)
  }

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
            {visning === 'enkel' ? (
              <FormattedMessage id="grunnlag.title" />
            ) : (
              <FormattedMessage id="grunnlag.title.avansert" />
            )}
          </Heading>
          <BodyLong>
            <FormattedMessage id="grunnlag.ingress" />
          </BodyLong>
        </div>
        <Accordion>
          {visning === 'enkel' && (
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
                      ...getFormatMessageValues(intl),
                    }}
                  />

                  <br />
                  <br />
                  <Link href="#" onClick={goToAvansert}>
                    <FormattedMessage id="grunnlag.uttaksgrad.avansert_link" />
                  </Link>
                </BodyLong>
              </GrunnlagSection>
            </AccordionItem>
          )}
          {visning === 'enkel' && <GrunnlagInntekt />}
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
                    ...getFormatMessageValues(intl),
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
                    ...getFormatMessageValues(intl),
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
                    ...getFormatMessageValues(intl),
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
                    ...getFormatMessageValues(intl),
                  }}
                />
              </BodyLong>
            </GrunnlagSection>
          </AccordionItem>
        </Accordion>
      </section>
      <GrunnlagForbehold />
    </>
  )
}
