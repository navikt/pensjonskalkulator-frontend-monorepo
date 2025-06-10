import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import clsx from 'clsx'
import { useContext, useEffect, useMemo } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { ArrowLeftIcon } from '@navikt/aksel-icons'
import { BodyLong, Heading, Link, VStack } from '@navikt/ds-react'

import { Grunnlag } from '@/components/Grunnlag'
import { GrunnlagForbehold } from '@/components/GrunnlagForbehold'
import { InfoOmLoependeVedtak } from '@/components/InfoOmLoependeVedtak'
import { Pensjonsavtaler } from '@/components/Pensjonsavtaler'
import { RedigerAvansertBeregning } from '@/components/RedigerAvansertBeregning'
import { SavnerDuNoe } from '@/components/SavnerDuNoe'
import { Simulering } from '@/components/Simulering'
import { Alert as AlertDashBorder } from '@/components/common/Alert'
import { SanityGuidePanel } from '@/components/common/SanityGuidePanel'
import { BeregningContext } from '@/pages/Beregning/context'
import { paths } from '@/router/constants'
import {
  apiSlice,
  useAlderspensjonQuery,
  useGetPersonQuery,
} from '@/state/api/apiSlice'
import { generateAlderspensjonRequestBody } from '@/state/api/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttakBeloep,
  selectAfp,
  selectAfpInntektMaanedFoerUttak,
  selectCurrentSimulation,
  selectEpsHarInntektOver2G,
  selectEpsHarPensjon,
  selectIsEndring,
  selectLoependeVedtak,
  selectNormertPensjonsalder,
  selectSamtykkeOffentligAFP,
  selectSivilstand,
  selectSkalBeregneAfpKap19,
  selectUtenlandsperioder,
} from '@/state/userInput/selectors'
import { formatUttaksalder } from '@/utils/alder'
import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './BeregningAvansert.module.scss'

export const BeregningAvansert = () => {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { avansertSkjemaModus, setAvansertSkjemaModus } =
    useContext(BeregningContext)

  const harSamtykketOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const afp = useAppSelector(selectAfp)
  const skalBeregneAfpKap19 = useAppSelector(selectSkalBeregneAfpKap19)
  const isEndring = useAppSelector(selectIsEndring)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )

  const epsHarPensjon = useAppSelector(selectEpsHarPensjon)
  const epsHarInntektOver2G = useAppSelector(selectEpsHarInntektOver2G)
  const sivilstand = useAppSelector(selectSivilstand)
  const { data: person } = useGetPersonQuery()
  const afpInntektMaanedFoerUttak = useAppSelector(
    selectAfpInntektMaanedFoerUttak
  )

  const normertPensjonsalder = useAppSelector(selectNormertPensjonsalder)
  const utenlandsperioder = useAppSelector(selectUtenlandsperioder)
  const {
    uttaksalder,
    aarligInntektVsaHelPensjon,
    gradertUttaksperiode,
    beregningsvalg,
  } = useAppSelector(selectCurrentSimulation)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const alderspensjonRequestBody: AlderspensjonRequestBody | undefined =
    useMemo(() => {
      if (uttaksalder) {
        return generateAlderspensjonRequestBody({
          loependeVedtak,
          afp: afp === 'ja_offentlig' && !harSamtykketOffentligAFP ? null : afp,
          skalBeregneAfpKap19: skalBeregneAfpKap19,
          sivilstand: sivilstand,
          epsHarPensjon: epsHarPensjon,
          epsHarInntektOver2G: epsHarInntektOver2G,
          foedselsdato: person?.foedselsdato,
          aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
          gradertUttak: gradertUttaksperiode,
          heltUttak: uttaksalder && {
            uttaksalder,
            aarligInntektVsaPensjon: aarligInntektVsaHelPensjon,
          },
          utenlandsperioder,
          beregningsvalg,
          afpInntektMaanedFoerUttak: afpInntektMaanedFoerUttak,
        })
      }
    }, [
      afp,
      person,
      aarligInntektFoerUttakBeloep,
      sivilstand,
      uttaksalder,
      epsHarPensjon,
      epsHarInntektOver2G,
      beregningsvalg,
    ])

  // Hent alderspensjon + AFP
  const {
    data: alderspensjon,
    isFetching,
    isError,
    error,
  } = useAlderspensjonQuery(
    alderspensjonRequestBody as AlderspensjonRequestBody,
    { skip: !alderspensjonRequestBody }
  )

  useEffect(() => {
    if (uttaksalder) {
      if (alderspensjon && !alderspensjon?.vilkaarsproeving.vilkaarErOppfylt) {
        logger('alert vist', {
          tekst: 'Beregning avansert: Ikke høy nok opptjening',
          variant: 'warning',
        })
      } else if (isError) {
        logger('alert vist', {
          tekst: 'Beregning avansert: Klarte ikke beregne pensjon',
          variant: 'error',
        })
      }
    }
  }, [uttaksalder, isError, alderspensjon])

  useEffect(() => {
    if (
      error &&
      ((error as FetchBaseQueryError).status === 503 ||
        (error as FetchBaseQueryError).status === 'PARSING_ERROR')
    ) {
      navigate(paths.uventetFeil)
      logger('info', {
        tekst: 'Redirect til /uventet-feil',
        data: 'fra Beregning Avansert',
      })
    }
  }, [error])

  // Skal redigerer tilbake når alderspensjon er refetchet ferdig, og
  useEffect(() => {
    if (alderspensjon && !alderspensjon.vilkaarsproeving.vilkaarErOppfylt) {
      setAvansertSkjemaModus('redigering')
    }
    if (alderspensjon?.vilkaarsproeving.vilkaarErOppfylt) {
      logger('resultat vist', { tekst: 'Beregning avansert' })
      logger('grunnlag for beregningen', {
        tekst: 'antall opphold',
        data: utenlandsperioder?.length ?? 0,
      })
    }
  }, [alderspensjon])

  const onRetry = (): void => {
    dispatch(apiSlice.util.invalidateTags(['Alderspensjon']))
    if (alderspensjonRequestBody) {
      dispatch(
        apiSlice.endpoints.alderspensjon.initiate(alderspensjonRequestBody)
      )
    }
  }

  if (avansertSkjemaModus === 'redigering') {
    return (
      <RedigerAvansertBeregning
        vilkaarsproeving={alderspensjon?.vilkaarsproeving}
      />
    )
  }

  const harHelUT = loependeVedtak?.ufoeretrygd.grad === 100
  const harGradertUT =
    loependeVedtak?.ufoeretrygd.grad > 0 &&
    loependeVedtak?.ufoeretrygd.grad < 100

  return (
    <>
      <InfoOmLoependeVedtak loependeVedtak={loependeVedtak} />

      <div
        className={clsx(
          styles.container,
          styles.container__hasMobilePadding,
          styles.container__hasTopMargin
        )}
      >
        <Link
          href="#"
          className={styles.link}
          onClick={(e) => {
            e?.preventDefault()
            logger('button klikk', {
              tekst: isEndring
                ? 'Beregning avansert: Endre valgene dine'
                : 'Beregning avansert: Endre avanserte valg',
            })
            setAvansertSkjemaModus('redigering')
          }}
        >
          <ArrowLeftIcon aria-hidden fontSize="1.5rem" />
          <FormattedMessage
            id={
              isEndring
                ? 'beregning.avansert.link.endre_valgene_dine'
                : 'beregning.avansert.link.endre_avanserte_valg'
            }
          />
        </Link>

        {isError ? (
          <>
            <Heading level="2" size="medium">
              <FormattedMessage id="beregning.title" />
            </Heading>

            <AlertDashBorder onRetry={isError ? onRetry : undefined}>
              {isError && <FormattedMessage id="beregning.error" />}
            </AlertDashBorder>
          </>
        ) : (
          <>
            <div
              className={clsx(styles.intro, {
                [styles.intro__endring]: isEndring,
              })}
            >
              <Heading level="2" size="medium" className={styles.introTitle}>
                <FormattedMessage
                  id={
                    isEndring
                      ? 'beregning.intro.title.endring'
                      : 'beregning.intro.title'
                  }
                />
              </Heading>

              <VStack gap="2">
                <BodyLong>
                  <FormattedMessage
                    id={
                      isEndring
                        ? 'beregning.intro.description_1.endring'
                        : 'beregning.intro.description_1'
                    }
                  />
                </BodyLong>

                {harGradertUT &&
                  (beregningsvalg === 'med_afp' ? (
                    <BodyLong>
                      <FormattedMessage id="beregning.intro.description_2.gradert_UT.med_afp" />
                    </BodyLong>
                  ) : (
                    <BodyLong>
                      <FormattedMessage
                        id="beregning.intro.description_2.gradert_UT.uten_afp"
                        values={{
                          ...getFormatMessageValues(),
                          grad: loependeVedtak.ufoeretrygd.grad,
                          normertPensjonsalder: formatUttaksalder(
                            intl,
                            normertPensjonsalder
                          ),
                        }}
                      />
                    </BodyLong>
                  ))}

                {harHelUT && (
                  <BodyLong>
                    <FormattedMessage id="beregning.intro.description_2.hel_UT" />
                  </BodyLong>
                )}
              </VStack>
            </div>

            <Simulering
              visning="avansert"
              isLoading={isFetching}
              headingLevel="3"
              aarligInntektFoerUttakBeloep={aarligInntektFoerUttakBeloep ?? '0'}
              alderspensjonListe={alderspensjon?.alderspensjon}
              pre2025OffentligAfp={alderspensjon?.pre2025OffentligAfp}
              afpPrivatListe={
                (afp === 'ja_privat' || loependeVedtak.afpPrivat) &&
                alderspensjon?.afpPrivat
                  ? alderspensjon?.afpPrivat
                  : undefined
              }
              afpOffentligListe={
                afp === 'ja_offentlig' &&
                harSamtykketOffentligAFP &&
                alderspensjon?.afpOffentlig
                  ? alderspensjon?.afpOffentlig
                  : undefined
              }
              alderspensjonMaanedligVedEndring={
                alderspensjon?.alderspensjonMaanedligVedEndring
              }
              showButtonsAndTable={
                !isError && alderspensjon?.vilkaarsproeving.vilkaarErOppfylt
              }
              detaljer={
                alderspensjon?.trygdetid ||
                alderspensjon?.opptjeningGrunnlagListe
                  ? {
                      trygdetid: alderspensjon?.trygdetid,
                      opptjeningsgrunnlag:
                        alderspensjon?.opptjeningGrunnlagListe,
                    }
                  : undefined
              }
            />

            {beregningsvalg === 'med_afp' && (
              <SanityGuidePanel
                id="vurderer_du_a_velge_afp"
                className={styles.guidePanel}
                hasSection
              />
            )}

            {!isEndring && <Pensjonsavtaler headingLevel="2" />}

            <Grunnlag
              visning="avansert"
              headingLevel="2"
              harForLiteTrygdetid={alderspensjon?.harForLiteTrygdetid}
              trygdetid={alderspensjon?.trygdetid}
              pensjonsbeholdning={
                alderspensjon?.alderspensjon &&
                alderspensjon?.alderspensjon.length > 0
                  ? alderspensjon?.alderspensjon[0]
                      .pensjonBeholdningFoerUttakBeloep
                  : undefined
              }
              isEndring={isEndring}
            />
          </>
        )}
      </div>

      {!isError && (
        <>
          {isEndring && (
            <div
              className={clsx(styles.background, styles.background__lightblue)}
            >
              <div className={styles.container}>
                <SavnerDuNoe headingLevel="3" isEndring={isEndring} />
              </div>
            </div>
          )}

          <div
            className={clsx(styles.container, {
              [styles.container__endring]: !isEndring,
            })}
          >
            <GrunnlagForbehold headingLevel="3" />
          </div>
        </>
      )}
    </>
  )
}
