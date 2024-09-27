import React from 'react'
import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Heading } from '@navikt/ds-react'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import clsx from 'clsx'

import { Alert } from '@/components/common/Alert'
import { Grunnlag } from '@/components/Grunnlag'
import { GrunnlagForbehold } from '@/components/GrunnlagForbehold'
import { Pensjonsavtaler } from '@/components/Pensjonsavtaler'
import { RedigerAvansertBeregning } from '@/components/RedigerAvansertBeregning'
import { ResultatkortAvansertBeregning } from '@/components/ResultatkortAvansertBeregning'
import { SavnerDuNoe } from '@/components/SavnerDuNoe'
import { Simulering } from '@/components/Simulering'
import { BeregningContext } from '@/pages/Beregning/context'
import { paths } from '@/router/constants'
import {
  useGetPersonQuery,
  apiSlice,
  useAlderspensjonQuery,
} from '@/state/api/apiSlice'
import { generateAlderspensjonRequestBody } from '@/state/api/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectSamboer,
  selectCurrentSimulation,
  selectSamtykkeOffentligAFP,
  selectAarligInntektFoerUttakBeloep,
  selectUfoeregrad,
} from '@/state/userInput/selectors'
import { logger } from '@/utils/logging'

import styles from './BeregningAvansert.module.scss'

export const BeregningAvansert: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { avansertSkjemaModus, setAvansertSkjemaModus } =
    React.useContext(BeregningContext)

  const harSamboer = useAppSelector(selectSamboer)
  const harSamtykketOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const afp = useAppSelector(selectAfp)
  const ufoeregrad = useAppSelector(selectUfoeregrad)
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )
  const { data: person } = useGetPersonQuery()

  const {
    uttaksalder,
    aarligInntektVsaHelPensjon,
    gradertUttaksperiode,
    utenlandsperioder,
  } = useAppSelector(selectCurrentSimulation)

  const [alderspensjonRequestBody, setAlderspensjonRequestBody] =
    React.useState<AlderspensjonRequestBody | undefined>(undefined)

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  React.useEffect(() => {
    if (uttaksalder) {
      const requestBody = generateAlderspensjonRequestBody({
        ufoeregrad,
        afp: afp === 'ja_offentlig' && !harSamtykketOffentligAFP ? null : afp,
        sivilstand: person?.sivilstand,
        harSamboer,
        foedselsdato: person?.foedselsdato,
        aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
        gradertUttak: gradertUttaksperiode
          ? {
              ...gradertUttaksperiode,
            }
          : undefined,
        heltUttak: uttaksalder && {
          uttaksalder,
          aarligInntektVsaPensjon: aarligInntektVsaHelPensjon,
        },
        utenlandsperioder,
      })
      setAlderspensjonRequestBody(requestBody)
    }
  }, [afp, person, aarligInntektFoerUttakBeloep, harSamboer, uttaksalder])

  // Hent alderspensjon + AFP
  const {
    data: alderspensjon,
    isFetching,
    isError,
    error,
  } = useAlderspensjonQuery(
    alderspensjonRequestBody as AlderspensjonRequestBody,
    {
      skip: !alderspensjonRequestBody,
    }
  )

  React.useEffect(() => {
    if (uttaksalder) {
      if (alderspensjon && !alderspensjon?.vilkaarsproeving.vilkaarErOppfylt) {
        logger('alert', {
          tekst: 'Beregning avansert: Ikke høy nok opptjening',
        })
      } else if (isError) {
        logger('alert', {
          tekst: 'Beregning avansert: Klarte ikke beregne pensjon',
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

  // Skal redigerer tilbake når alderspensjon er refetchet ferdig, og
  React.useEffect(() => {
    if (alderspensjon && !alderspensjon?.vilkaarsproeving.vilkaarErOppfylt) {
      setAvansertSkjemaModus('redigering')
    }
    if (alderspensjon && alderspensjon.vilkaarsproeving.vilkaarErOppfylt) {
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

  return (
    <>
      {avansertSkjemaModus === 'redigering' && (
        <RedigerAvansertBeregning
          gaaTilResultat={() => {
            setAvansertSkjemaModus('resultat')
            window.scrollTo(0, 0)
          }}
          vilkaarsproeving={alderspensjon?.vilkaarsproeving}
        />
      )}

      {avansertSkjemaModus === 'resultat' && (
        <>
          {isError ? (
            <div
              className={`${styles.container} ${styles.container__hasMobilePadding} ${styles.container__hasTopMargin}`}
            >
              <Heading level="2" size="small">
                <FormattedMessage id="beregning.title" />
              </Heading>
              <Alert onRetry={isError ? onRetry : undefined}>
                {isError && <FormattedMessage id="beregning.error" />}
              </Alert>
              <ResultatkortAvansertBeregning
                onButtonClick={() => setAvansertSkjemaModus('redigering')}
              />
            </div>
          ) : (
            <>
              <div
                className={`${styles.container} ${styles.container__hasMobilePadding} ${styles.container__hasTopMargin}`}
              >
                <Simulering
                  isLoading={isFetching}
                  headingLevel="2"
                  aarligInntektFoerUttakBeloep={
                    aarligInntektFoerUttakBeloep ?? '0'
                  }
                  alderspensjonListe={alderspensjon?.alderspensjon}
                  afpPrivatListe={
                    !ufoeregrad &&
                    afp === 'ja_privat' &&
                    alderspensjon?.afpPrivat
                      ? alderspensjon?.afpPrivat
                      : undefined
                  }
                  afpOffentligListe={
                    !ufoeregrad &&
                    afp === 'ja_offentlig' &&
                    harSamtykketOffentligAFP &&
                    alderspensjon?.afpOffentlig
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
                <ResultatkortAvansertBeregning
                  onButtonClick={() => setAvansertSkjemaModus('redigering')}
                />
                <Pensjonsavtaler headingLevel="2" />
                <Grunnlag
                  visning="avansert"
                  headingLevel="2"
                  harForLiteTrygdetid={alderspensjon?.harForLiteTrygdetid}
                />
              </div>
              <>
                <div
                  className={clsx(
                    styles.background,
                    styles.background__lightblue
                  )}
                >
                  <div className={styles.container}>
                    <SavnerDuNoe headingLevel="3" />
                  </div>
                </div>
                <div className={styles.container}>
                  <GrunnlagForbehold headingLevel="3" />
                </div>
              </>
            </>
          )}
        </>
      )}
    </>
  )
}
