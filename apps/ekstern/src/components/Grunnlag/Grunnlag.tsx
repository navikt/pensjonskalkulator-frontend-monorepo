import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import {
  Accordion,
  BodyLong,
  Heading,
  HeadingProps,
  Link,
} from '@navikt/ds-react'

import { AccordionItem } from '@/components/common/AccordionItem'
import { paths } from '@/router/constants'
import { useGetPersonQuery } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamboer } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { BeregningVisning } from '@/types/common-types'
import { formatSivilstand } from '@/utils/sivilstand'
import { getFormatMessageValues } from '@/utils/translations'

import { GrunnlagAFP } from './GrunnlagAFP'
import { GrunnlagInntekt } from './GrunnlagInntekt'
import { GrunnlagSection } from './GrunnlagSection'
import { GrunnlagUtenlandsopphold } from './GrunnlagUtenlandsopphold'

import styles from './Grunnlag.module.scss'

interface Props {
  visning: BeregningVisning
  headingLevel: HeadingProps['level']
  harForLiteTrygdetid?: boolean
}

export const Grunnlag: React.FC<Props> = ({
  visning,
  headingLevel,
  harForLiteTrygdetid,
}) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const goToAvansert: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault()
    dispatch(userInputActions.flushCurrentSimulationUtenomUtenlandsperioder())
    navigate(paths.beregningAvansert)
  }

  const goToStart: React.MouseEventHandler<HTMLAnchorElement> = (e): void => {
    e.preventDefault()
    dispatch(userInputActions.flush())
    navigate(paths.start)
  }

  const intl = useIntl()

  const { data: person, isSuccess } = useGetPersonQuery()
  const harSamboer = useAppSelector(selectSamboer)

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
    <section className={styles.section}>
      <div className={styles.description}>
        <Heading level={headingLevel} size="medium">
          <FormattedMessage id="grunnlag.title" />
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
        {visning === 'enkel' && <GrunnlagInntekt goToAvansert={goToAvansert} />}
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

        <GrunnlagUtenlandsopphold harForLiteTrygdetid={harForLiteTrygdetid} />

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

        <GrunnlagAFP goToStart={goToStart} />
      </Accordion>
    </section>
  )
}
