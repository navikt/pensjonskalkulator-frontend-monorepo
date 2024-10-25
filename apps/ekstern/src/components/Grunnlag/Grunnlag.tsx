import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import {
  Accordion,
  BodyLong,
  Heading,
  HeadingProps,
  Link,
} from '@navikt/ds-react'

import { AccordionItem } from '@/components/common/AccordionItem'
import { paths } from '@/router/constants'
import {
  useGetPersonQuery,
  useGetUtlandFeatureToggleQuery,
} from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectSamboer,
  selectUfoeregrad,
  selectSamtykkeOffentligAFP,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { BeregningVisning } from '@/types/common-types'
import { formatAfp } from '@/utils/afp'
import { formatSivilstand } from '@/utils/sivilstand'
import { getFormatMessageValues } from '@/utils/translations'

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

  const goToStart: React.MouseEventHandler<HTMLAnchorElement> = (e): void => {
    e.preventDefault()
    dispatch(userInputActions.flush())
    navigate(paths.start)
  }

  const goToAvansert: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault()
    dispatch(userInputActions.flushCurrentSimulationUtenomUtenlandsperioder())
    navigate(paths.beregningAvansert)
  }

  const intl = useIntl()

  const { data: person, isSuccess } = useGetPersonQuery()
  const { data: utlandFeatureToggle } = useGetUtlandFeatureToggleQuery()
  const afp = useAppSelector(selectAfp)
  const harSamtykketOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const harSamboer = useAppSelector(selectSamboer)
  const ufoeregrad = useAppSelector(selectUfoeregrad)

  const formatertAfp = React.useMemo(() => {
    const afpString = formatAfp(intl, afp ?? 'vet_ikke')
    if (ufoeregrad && (afp === 'ja_offentlig' || afp === 'ja_privat')) {
      return `${afpString} (${intl.formatMessage({ id: 'grunnlag.afp.ikke_beregnet' })})`
    }
    if (!harSamtykketOffentligAFP && !ufoeregrad && afp === 'ja_offentlig') {
      return `${afpString} (${intl.formatMessage({ id: 'grunnlag.afp.ikke_beregnet' })})`
    }
    return afpString
  }, [afp])

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

        {utlandFeatureToggle?.enabled ? (
          <GrunnlagUtenlandsopphold harForLiteTrygdetid={harForLiteTrygdetid} />
        ) : (
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
        )}

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
                id={`grunnlag.afp.ingress.${afp === 'ja_offentlig' && !harSamtykketOffentligAFP && !ufoeregrad ? 'ja_offentlig_utilgjengelig' : afp}${ufoeregrad ? '.ufoeretrygd' : ''}`}
                values={{
                  ...getFormatMessageValues(intl),
                }}
              />

              {!ufoeregrad && afp === 'nei' && (
                <>
                  <Link href="#" onClick={goToStart}>
                    <FormattedMessage id="grunnlag.afp.reset_link" />
                  </Link>
                  .
                </>
              )}
            </BodyLong>
          </GrunnlagSection>
        </AccordionItem>
      </Accordion>
    </section>
  )
}
