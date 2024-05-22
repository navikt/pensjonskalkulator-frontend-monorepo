import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Alert, Heading } from '@navikt/ds-react'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import clsx from 'clsx'

import { Alert as AlertDashBorder } from '@/components/common/Alert'
import { Loader } from '@/components/common/Loader'
import { Grunnlag } from '@/components/Grunnlag'
import { GrunnlagForbehold } from '@/components/GrunnlagForbehold'
import { OmUfoeretrygd } from '@/components/OmUfoeregrad'
import { Pensjonsavtaler } from '@/components/Pensjonsavtaler'
import { SavnerDuNoe } from '@/components/SavnerDuNoe'
import { Simulering } from '@/components/Simulering'
import { TidligstMuligUttaksalder } from '@/components/TidligstMuligUttaksalder'
import { VelgUttaksalder } from '@/components/VelgUttaksalder'
import { paths } from '@/router/constants'
import {
  apiSlice,
  useGetPersonQuery,
  useGetAfpOffentligFeatureToggleQuery,
  useTidligstMuligHeltUttakQuery,
  useAlderspensjonQuery,
} from '@/state/api/apiSlice'
import { generateTidligstMuligHeltUttakRequestBody } from '@/state/api/utils'
import { generateAlderspensjonEnkelRequestBody } from '@/state/api/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectSamboer,
  selectSivilstand,
  selectCurrentSimulation,
  selectAarligInntektFoerUttakBeloep,
  selectAarligInntektFoerUttakBeloepFraBrukerInput,
  selectUfoeregrad,
} from '@/state/userInput/selectors'
import { DEFAULT_UBETINGET_UTTAKSALDER, isFoedtFoer1964 } from '@/utils/alder'
import { logger } from '@/utils/logging'

import styles from './BeregningEnkel.module.scss'

export const BeregningEnkel: React.FC = () => {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const harSamboer = useAppSelector(selectSamboer)
  const afp = useAppSelector(selectAfp)
  const sivilstand = useAppSelector(selectSivilstand)
  const ufoeregrad = useAppSelector(selectUfoeregrad)
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )
  const aarligInntektFoerUttakBeloepFraBrukerInput = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraBrukerInput
  )

  const { isSuccess: isPersonSuccess, data: person } = useGetPersonQuery()
  const { data: afpOffentligFeatureToggle } =
    useGetAfpOffentligFeatureToggleQuery()

  const [
    tidligstMuligHeltUttakRequestBody,
    setTidligstMuligHeltUttakRequestBody,
  ] = React.useState<TidligstMuligHeltUttakRequestBody | undefined>(undefined)
  // Hent tidligst mulig uttaksalder
  const {
    data: tidligstMuligUttak,
    isLoading: isTidligstMuligUttakLoading,
    isSuccess: isTidligstMuligUttakSuccess,
  } = useTidligstMuligHeltUttakQuery(tidligstMuligHeltUttakRequestBody, {
    skip: !tidligstMuligHeltUttakRequestBody || !!ufoeregrad,
  })

  const { uttaksalder } = useAppSelector(selectCurrentSimulation)
  const [alderspensjonEnkelRequestBody, setAlderspensjonEnkelRequestBody] =
    React.useState<AlderspensjonRequestBody | undefined>(undefined)
  const [showInntektAlert, setShowInntektAlert] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Show alert når: inntekt fra bruker er ikke null (det betyr at brukeren har endret den) og at startAlder er null (betyr at de ble nettopp nullstilt fra GrunnlagInntekt)
    setShowInntektAlert(
      !!aarligInntektFoerUttakBeloepFraBrukerInput && uttaksalder === null
    )
  }, [aarligInntektFoerUttakBeloepFraBrukerInput, uttaksalder])

  React.useEffect(() => {
    const requestBody = generateTidligstMuligHeltUttakRequestBody({
      afp: afpOffentligFeatureToggle?.enabled
        ? afp
        : afp === 'ja_offentlig'
          ? 'vet_ikke'
          : afp,
      sivilstand: sivilstand,
      harSamboer,
      aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
    })
    setTidligstMuligHeltUttakRequestBody(requestBody)
  }, [afp, sivilstand, aarligInntektFoerUttakBeloep, harSamboer])

  React.useEffect(() => {
    if (uttaksalder) {
      const requestBody = generateAlderspensjonEnkelRequestBody({
        afp: afpOffentligFeatureToggle?.enabled
          ? afp
          : afp === 'ja_offentlig'
            ? 'vet_ikke'
            : afp,
        sivilstand: person?.sivilstand,
        harSamboer,
        foedselsdato: person?.foedselsdato,
        aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
        uttaksalder,
      })
      setAlderspensjonEnkelRequestBody(requestBody)
    }
  }, [afp, person, aarligInntektFoerUttakBeloep, harSamboer, uttaksalder])

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

  React.useEffect(() => {
    if (alderspensjon && alderspensjon.vilkaarsproeving.vilkaarErOppfylt) {
      logger('resultat vist', { tekst: 'Beregning enkel' })
    }
  }, [alderspensjon])

  React.useEffect(() => {
    if (uttaksalder !== null) {
      if (alderspensjon && !alderspensjon?.vilkaarsproeving.vilkaarErOppfylt) {
        logger('alert', { tekst: 'Beregning enkel: Ikke høy nok opptjening' })
      } else if (isError) {
        logger('alert', {
          tekst: 'Beregning enkel: Klarte ikke beregne pensjon',
        })
      }
    }
  }, [uttaksalder, isError, alderspensjon])

  React.useEffect(() => {
    if (
      error &&
      ((error as FetchBaseQueryError).status === 503 ||
        (error as FetchBaseQueryError).status === 'PARSING_ERROR')
    ) {
      navigate(paths.uventetFeil)
    }
  }, [error])

  const show1963Text = React.useMemo(() => {
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
          {ufoeregrad ? (
            <OmUfoeretrygd ufoeregrad={ufoeregrad} />
          ) : (
            <TidligstMuligUttaksalder
              tidligstMuligUttak={
                isTidligstMuligUttakSuccess ? tidligstMuligUttak : undefined
              }
              hasAfpOffentlig={
                afpOffentligFeatureToggle?.enabled
                  ? false
                  : afp === 'ja_offentlig'
              }
              show1963Text={show1963Text}
            />
          )}
        </div>
      </div>

      <div className={styles.container}>
        <VelgUttaksalder
          tidligstMuligUttak={
            ufoeregrad
              ? { ...DEFAULT_UBETINGET_UTTAKSALDER }
              : isTidligstMuligUttakSuccess
                ? tidligstMuligUttak
                : undefined
          }
        />
      </div>

      {uttaksalder !== null && (
        <div
          className={`${styles.container} ${styles.container__hasMobilePadding}`}
        >
          {isError ||
          (alderspensjon &&
            !alderspensjon?.vilkaarsproeving.vilkaarErOppfylt) ? (
            <>
              <Heading level="2" size="small">
                <FormattedMessage id="beregning.title" />
              </Heading>
              <AlertDashBorder onRetry={isError ? onRetry : undefined}>
                {!isError &&
                  uttaksalder &&
                  uttaksalder.aar < DEFAULT_UBETINGET_UTTAKSALDER.aar && (
                    <FormattedMessage
                      id="beregning.lav_opptjening.aar"
                      values={{ startAar: uttaksalder.aar }}
                    />
                  )}
                {isError && <FormattedMessage id="beregning.error" />}
              </AlertDashBorder>
            </>
          ) : (
            <>
              <Simulering
                isLoading={isFetching}
                headingLevel="3"
                aarligInntektFoerUttakBeloep={
                  aarligInntektFoerUttakBeloep ?? '0'
                }
                alderspensjonListe={alderspensjon?.alderspensjon}
                afpPrivatListe={
                  !ufoeregrad && afp === 'ja_privat'
                    ? alderspensjon?.afpPrivat?.afpPrivatListe
                    : undefined
                }
                afpOffentligListe={
                  !ufoeregrad && afp === 'ja_offentlig'
                    ? alderspensjon?.afpOffentlig?.afpOffentligListe
                    : undefined
                }
                showButtonsAndTable={
                  !isError && alderspensjon?.vilkaarsproeving.vilkaarErOppfylt
                }
              />
              <Pensjonsavtaler headingLevel="3" />
              <Grunnlag
                visning="enkel"
                headingLevel="3"
                afpLeverandoer={alderspensjon?.afpOffentlig?.afpLeverandoer}
              />
            </>
          )}
        </div>
      )}
      {uttaksalder !== null &&
        alderspensjon &&
        alderspensjon?.vilkaarsproeving.vilkaarErOppfylt && (
          <>
            <div
              className={clsx(styles.background, styles.background__lightblue)}
            >
              <div className={styles.container}>
                <SavnerDuNoe headingLevel="3" showAvansert />
              </div>
            </div>
            <div className={styles.container}>
              <GrunnlagForbehold headingLevel="3" />
            </div>
          </>
        )}
    </>
  )
}
