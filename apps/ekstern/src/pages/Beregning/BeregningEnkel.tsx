import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Alert, Heading } from '@navikt/ds-react'

import { Grunnlag } from '@/components/Grunnlag'
import { GrunnlagForbehold } from '@/components/GrunnlagForbehold'
import { SavnerDuNoe } from '@/components/SavnerDuNoe'
import { Signals } from '@/components/Signals'
import { Simulering } from '@/components/Simulering'
import { TidligstMuligUttaksalder } from '@/components/TidligstMuligUttaksalder'
import { VelgUttaksalder } from '@/components/VelgUttaksalder'
import { Alert as AlertDashBorder } from '@/components/common/Alert'
import { Loader } from '@/components/common/Loader'
import { paths } from '@/router/constants'
import {
  apiSlice,
  useAlderspensjonQuery,
  useGetAfpOffentligLivsvarigQuery,
  useGetPersonQuery,
  useTidligstMuligHeltUttakQuery,
} from '@/state/api/apiSlice'
import {
  generateAlderspensjonEnkelRequestBody,
  generateTidligstMuligHeltUttakRequestBody,
} from '@/state/api/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttakBeloep,
  selectAarligInntektFoerUttakBeloepFraBrukerInput,
  selectAfp,
  selectCurrentSimulation,
  selectEpsHarInntektOver2G,
  selectEpsHarPensjon,
  selectFoedselsdato,
  selectIsEndring,
  selectLoependeVedtak,
  selectNedreAldersgrense,
  selectNormertPensjonsalder,
  selectSamtykkeOffentligAFP,
  selectSivilstand,
  selectUfoeregrad,
  selectUtenlandsperioder,
} from '@/state/userInput/selectors'
import {
  getBrukerensAlderISluttenAvMaaneden,
  isAlder75MaanedenFylt,
  isAlderOver62,
  isFoedtFoer1964,
} from '@/utils/alder'
import { ALERT_VIST } from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'

import styles from './BeregningEnkel.module.scss'

export const BeregningEnkel = () => {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const harSamtykketOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const afp = useAppSelector(selectAfp)
  const sivilstand = useAppSelector(selectSivilstand)
  const ufoeregrad = useAppSelector(selectUfoeregrad)
  const isEndring = useAppSelector(selectIsEndring)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )
  const aarligInntektFoerUttakBeloepFraBrukerInput = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraBrukerInput
  )
  const nedreAldersgrense = useAppSelector(selectNedreAldersgrense)
  const normertPensjonsalder = useAppSelector(selectNormertPensjonsalder)
  const epsHarPensjon = useAppSelector(selectEpsHarPensjon)
  const epsHarInntektOver2G = useAppSelector(selectEpsHarInntektOver2G)

  const { isSuccess: isPersonSuccess, data: person } = useGetPersonQuery()
  const foedselsdato = useAppSelector(selectFoedselsdato)
  const {
    isSuccess: isAfpOffentligLivsvarigSuccess,
    data: loependeLivsvarigAfpOffentlig,
  } = useGetAfpOffentligLivsvarigQuery(undefined, {
    skip:
      !harSamtykketOffentligAFP ||
      !foedselsdato ||
      !isAlderOver62(foedselsdato),
  })

  const [
    tidligstMuligHeltUttakRequestBody,
    setTidligstMuligHeltUttakRequestBody,
  ] = useState<TidligstMuligHeltUttakRequestBody | undefined>(undefined)
  // Hent tidligst mulig uttaksalder
  const {
    data: tidligstMuligUttak,
    isLoading: isTidligstMuligUttakLoading,
    isSuccess: isTidligstMuligUttakSuccess,
  } = useTidligstMuligHeltUttakQuery(tidligstMuligHeltUttakRequestBody, {
    skip:
      !tidligstMuligHeltUttakRequestBody ||
      Boolean(ufoeregrad) ||
      Boolean(loependeVedtak.pre2025OffentligAfp),
  })

  const utenlandsperioder = useAppSelector(selectUtenlandsperioder)
  const { uttaksalder } = useAppSelector(selectCurrentSimulation)
  const [alderspensjonEnkelRequestBody, setAlderspensjonEnkelRequestBody] =
    useState<AlderspensjonRequestBody | undefined>(undefined)
  const [showInntektAlert, setShowInntektAlert] = useState<boolean>(false)

  useEffect(() => {
    // Show alert når: inntekt fra bruker er ikke null (det betyr at brukeren har endret den) og at startAlder er null (betyr at de ble nettopp nullstilt fra GrunnlagInntekt)
    setShowInntektAlert(
      Boolean(aarligInntektFoerUttakBeloepFraBrukerInput) &&
        uttaksalder === null
    )
  }, [aarligInntektFoerUttakBeloepFraBrukerInput, uttaksalder])

  useEffect(() => {
    if (!ufoeregrad && !loependeVedtak.pre2025OffentligAfp) {
      const requestBody = generateTidligstMuligHeltUttakRequestBody({
        loependeVedtak,
        afp: afp === 'ja_offentlig' && !harSamtykketOffentligAFP ? null : afp,
        sivilstand: sivilstand,
        epsHarPensjon,
        epsHarInntektOver2G,
        aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
        utenlandsperioder,
        loependeLivsvarigAfpOffentlig: isAfpOffentligLivsvarigSuccess
          ? loependeLivsvarigAfpOffentlig
          : null,
      })
      setTidligstMuligHeltUttakRequestBody(requestBody)
    }
  }, [
    ufoeregrad,
    afp,
    sivilstand,
    aarligInntektFoerUttakBeloep,
    epsHarPensjon,
    epsHarInntektOver2G,
  ])

  useEffect(() => {
    if (uttaksalder) {
      const requestBody = generateAlderspensjonEnkelRequestBody({
        loependeVedtak,
        afp: afp === 'ja_offentlig' && !harSamtykketOffentligAFP ? null : afp,
        sivilstand: sivilstand ?? 'UOPPGITT',
        epsHarPensjon,
        epsHarInntektOver2G,
        foedselsdato: person?.foedselsdato,
        aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
        uttaksalder,
        utenlandsperioder,
        loependeLivsvarigAfpOffentlig: isAfpOffentligLivsvarigSuccess
          ? loependeLivsvarigAfpOffentlig
          : null,
      })
      setAlderspensjonEnkelRequestBody(requestBody)
    }
  }, [
    afp,
    person,
    aarligInntektFoerUttakBeloep,
    uttaksalder,
    sivilstand,
    epsHarPensjon,
    epsHarInntektOver2G,
    isAfpOffentligLivsvarigSuccess,
    loependeLivsvarigAfpOffentlig,
  ])

  // Hent alderspensjon + AFP
  const {
    data: alderspensjon,
    isFetching,
    isError,
    error,
  } = useAlderspensjonQuery(
    alderspensjonEnkelRequestBody as AlderspensjonRequestBody,
    {
      skip: !alderspensjonEnkelRequestBody,
    }
  )

  useEffect(() => {
    if (alderspensjon?.vilkaarsproeving.vilkaarErOppfylt) {
      logger('resultat vist', { tekst: 'Beregning enkel' })
      logger('grunnlag for beregningen', {
        tekst: 'antall opphold',
        data: utenlandsperioder?.length ?? 0,
      })
    }
  }, [alderspensjon])

  useEffect(() => {
    if (uttaksalder !== null) {
      if (alderspensjon && !alderspensjon?.vilkaarsproeving.vilkaarErOppfylt) {
        logger(ALERT_VIST, {
          tekst: 'Beregning enkel: Ikke høy nok opptjening',
          variant: 'warning',
        })
      } else if (isError) {
        logger(ALERT_VIST, {
          tekst: 'Beregning enkel: Klarte ikke beregne pensjon',
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
        data: 'fra Beregning Enkel',
      })
    }
  }, [error])

  const show1963Text = useMemo(() => {
    return isPersonSuccess && isFoedtFoer1964(person?.foedselsdato)
  }, [person])

  const onRetry = (): void => {
    dispatch(apiSlice.util.invalidateTags(['Alderspensjon']))
    if (alderspensjonEnkelRequestBody) {
      dispatch(
        apiSlice.endpoints.alderspensjon.initiate(alderspensjonEnkelRequestBody)
      )
    }
  }
  const dismissAlert = () => {
    setShowInntektAlert(false)
  }

  if (isTidligstMuligUttakLoading) {
    return (
      <Loader
        data-testid="uttaksalder-loader"
        size="3xlarge"
        title={intl.formatMessage({
          id: 'beregning.loading',
        })}
      />
    )
  }

  const tidligstMuligUttakPre2025OffentligAfp = {
    aar: 67,
    maaneder: 0,
  }

  const isOver75AndNoLoependeVedtak =
    !loependeVedtak.harLoependeVedtak &&
    !!person?.foedselsdato &&
    isAlder75MaanedenFylt(person.foedselsdato)

  return (
    <>
      {showInntektAlert && (
        <div className={styles.container}>
          <Alert
            data-testid="alert-inntekt"
            className={styles.alert}
            variant="info"
            closeButton={true}
            onClose={dismissAlert}
          >
            <FormattedMessage id="beregning.alert.inntekt" />
          </Alert>
        </div>
      )}

      <div className={clsx(styles.background, styles.background__lightgray)}>
        <div className={styles.container}>
          <TidligstMuligUttaksalder
            tidligstMuligUttak={
              isTidligstMuligUttakSuccess
                ? tidligstMuligUttak
                : loependeVedtak.pre2025OffentligAfp
                  ? tidligstMuligUttakPre2025OffentligAfp
                  : undefined
            }
            ufoeregrad={ufoeregrad}
            show1963Text={show1963Text}
            loependeVedtakPre2025OffentligAfp={Boolean(
              loependeVedtak.pre2025OffentligAfp
            )}
            isOver75AndNoLoependeVedtak={isOver75AndNoLoependeVedtak}
          />
        </div>
      </div>

      {loependeVedtak.pre2025OffentligAfp ? (
        <div className={styles.container}>
          <VelgUttaksalder
            tidligstMuligUttak={tidligstMuligUttakPre2025OffentligAfp}
          />
        </div>
      ) : (
        <div className={styles.container}>
          <VelgUttaksalder
            tidligstMuligUttak={
              ufoeregrad
                ? normertPensjonsalder
                : isTidligstMuligUttakSuccess
                  ? tidligstMuligUttak
                  : getBrukerensAlderISluttenAvMaaneden(
                      person?.foedselsdato,
                      nedreAldersgrense
                    )
            }
          />
        </div>
      )}

      {uttaksalder !== null && (
        <div
          className={clsx(styles.container, styles.container__hasMobilePadding)}
        >
          {isError ||
          (alderspensjon &&
            !alderspensjon?.vilkaarsproeving.vilkaarErOppfylt &&
            uttaksalder &&
            uttaksalder.aar < normertPensjonsalder.aar) ? (
            <>
              <Heading level="2" size="medium" data-testid="beregning-heading">
                <FormattedMessage id="beregning.title" />
              </Heading>

              <AlertDashBorder onRetry={isError ? onRetry : undefined}>
                {isError ? (
                  <FormattedMessage id="beregning.error" />
                ) : (
                  <FormattedMessage
                    id="beregning.lav_opptjening.aar"
                    values={{
                      startAar: uttaksalder.aar,
                      startMaaned:
                        uttaksalder.maaneder > 0
                          ? ` og ${uttaksalder.maaneder} måneder`
                          : '',
                    }}
                  />
                )}
              </AlertDashBorder>
            </>
          ) : (
            <>
              <Simulering
                visning="enkel"
                isLoading={isFetching}
                headingLevel="2"
                aarligInntektFoerUttakBeloep={
                  aarligInntektFoerUttakBeloep ?? '0'
                }
                alderspensjonListe={alderspensjon?.alderspensjon}
                pre2025OffentligAfp={alderspensjon?.pre2025OffentligAfp}
                afpPrivatListe={
                  !ufoeregrad &&
                  (afp === 'ja_privat' || loependeVedtak.afpPrivat)
                    ? alderspensjon?.afpPrivat
                    : undefined
                }
                afpOffentligListe={
                  !ufoeregrad &&
                  afp === 'ja_offentlig' &&
                  harSamtykketOffentligAFP
                    ? alderspensjon?.afpOffentlig
                    : undefined
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

              <Grunnlag
                visning="enkel"
                headingLevel="2"
                harForLiteTrygdetid={alderspensjon?.harForLiteTrygdetid}
                trygdetid={alderspensjon?.trygdetid}
                isEndring={isEndring}
                alderspensjonListe={alderspensjon?.alderspensjon}
                afpPrivatListe={alderspensjon?.afpPrivat}
                afpOffentligListe={alderspensjon?.afpOffentlig}
                pre2025OffentligAfp={alderspensjon?.pre2025OffentligAfp}
              />
            </>
          )}
        </div>
      )}

      {uttaksalder !== null &&
        alderspensjon &&
        alderspensjon?.vilkaarsproeving.vilkaarErOppfylt && (
          <>
            <div className={styles.container}>
              <SavnerDuNoe isEndring={isEndring} />
            </div>

            <div className={styles.container}>
              <GrunnlagForbehold headingLevel="3" />
            </div>

            <Signals id="panel-qc608mkm1s" breakpoint="lg" />
          </>
        )}
    </>
  )
}
