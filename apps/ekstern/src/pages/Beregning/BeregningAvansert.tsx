import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Heading } from '@navikt/ds-react'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { Alert } from '@/components/common/Alert'
import { Grunnlag } from '@/components/Grunnlag'
import { Pensjonsavtaler } from '@/components/Pensjonsavtaler'
import { RedigerAvansertBeregning } from '@/components/RedigerAvansertBeregning'
import { ResultatkortAvansertBeregning } from '@/components/ResultatkortAvansertBeregning'
import { Simulering } from '@/components/Simulering'
import { BeregningContext } from '@/pages/Beregning/context'
import {
  useGetPersonQuery,
  apiSlice,
  useAlderspensjonQuery,
  useGetAfpOffentligFeatureToggleQuery,
} from '@/state/api/apiSlice'
import { generateAlderspensjonRequestBody } from '@/state/api/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectSamboer,
  selectCurrentSimulation,
  selectAarligInntektFoerUttakBeloep,
} from '@/state/userInput/selectors'
import { logger } from '@/utils/logging'

import styles from './BeregningAvansert.module.scss'

export const BeregningAvansert: React.FC = () => {
  const dispatch = useAppDispatch()

  const { avansertSkjemaModus, setAvansertSkjemaModus } =
    React.useContext(BeregningContext)

  const harSamboer = useAppSelector(selectSamboer)
  const afp = useAppSelector(selectAfp)
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )
  const { data: person } = useGetPersonQuery()
  const { data: afpOffentligFeatureToggle } =
    useGetAfpOffentligFeatureToggleQuery()

  const { uttaksalder, aarligInntektVsaHelPensjon, gradertUttaksperiode } =
    useAppSelector(selectCurrentSimulation)

  const [alderspensjonRequestBody, setAlderspensjonRequestBody] =
    React.useState<AlderspensjonRequestBody | undefined>(undefined)

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  React.useEffect(() => {
    if (uttaksalder) {
      const requestBody = generateAlderspensjonRequestBody({
        afp: afpOffentligFeatureToggle?.enabled
          ? afp
          : afp === 'ja_offentlig'
            ? 'vet_ikke'
            : afp,
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
    if (error && (error as FetchBaseQueryError).status === 503) {
      throw new Error((error as FetchBaseQueryError).data as string)
    }
  }, [error])

  // Skal redigerer tilbake når alderspensjon er refetchet ferdig, og
  React.useEffect(() => {
    if (alderspensjon && !alderspensjon?.vilkaarsproeving.vilkaarErOppfylt) {
      setAvansertSkjemaModus('redigering')
    }
    if (alderspensjon && alderspensjon.vilkaarsproeving.vilkaarErOppfylt) {
      logger('resultat vist', { tekst: 'Beregning avansert' })
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
        <div
          className={`${styles.container} ${styles.container__hasMobilePadding} ${styles.container__hasTopMargin}`}
        >
          {isError ? (
            <>
              <Heading level="2" size="small">
                <FormattedMessage id="beregning.title" />
              </Heading>
              <Alert onRetry={isError ? onRetry : undefined}>
                {isError && <FormattedMessage id="beregning.error" />}
              </Alert>
              <ResultatkortAvansertBeregning
                onButtonClick={() => setAvansertSkjemaModus('redigering')}
              />
            </>
          ) : (
            <>
              <Simulering
                isLoading={isFetching}
                aarligInntektFoerUttakBeloep={
                  aarligInntektFoerUttakBeloep ?? '0'
                }
                alderspensjon={alderspensjon}
                showAfp={afp === 'ja_privat'}
                showButtonsAndTable={
                  !isError && alderspensjon?.vilkaarsproeving.vilkaarErOppfylt
                }
              />
              <ResultatkortAvansertBeregning
                onButtonClick={() => setAvansertSkjemaModus('redigering')}
              />
              <Pensjonsavtaler />
              <Grunnlag visning="avansert" />
            </>
          )}
        </div>
      )}
    </>
  )
}
