import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Heading } from '@navikt/ds-react'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { AccordionContext as PensjonsavtalerAccordionContext } from '@/components/common/AccordionItem'
import { Alert } from '@/components/common/Alert'
import { Grunnlag } from '@/components/Grunnlag'
import { RedigerAvansertBeregning } from '@/components/RedigerAvansertBeregning'
import { ResultatkortAvansertBeregning } from '@/components/ResultatkortAvansertBeregning'
import { Simulering } from '@/components/Simulering'
import { BeregningContext } from '@/pages/Beregning/context'
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
  selectFormatertUttaksalderReadOnly,
  selectAarligInntektFoerUttakBeloep,
} from '@/state/userInput/selectors'
import { logger } from '@/utils/logging'

import styles from './BeregningAvansert.module.scss'

export const BeregningAvansert: React.FC = () => {
  const dispatch = useAppDispatch()

  const { avansertSkjemaModus, setAvansertSkjemaModus } =
    React.useContext(BeregningContext)

  const grunnlagPensjonsavtalerRef = React.useRef<HTMLSpanElement>(null)
  const harSamboer = useAppSelector(selectSamboer)
  const afp = useAppSelector(selectAfp)
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )

  const formatertUttaksalderReadOnly = useAppSelector(
    selectFormatertUttaksalderReadOnly
  )
  const { data: person } = useGetPersonQuery()

  const { uttaksalder, aarligInntektVsaHelPensjon, gradertUttaksperiode } =
    useAppSelector(selectCurrentSimulation)

  const [alderspensjonRequestBody, setAlderspensjonRequestBody] =
    React.useState<AlderspensjonRequestBody | undefined>(undefined)

  React.useEffect(() => {
    if (uttaksalder) {
      const requestBody = generateAlderspensjonRequestBody({
        afp,
        sivilstand: person?.sivilstand,
        harSamboer,
        foedselsdato: person?.foedselsdato,
        aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? 0,
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
    if (formatertUttaksalderReadOnly) {
      if (alderspensjon && !alderspensjon?.vilkaarErOppfylt) {
        logger('alert', {
          teskt: 'Beregning avansert: Ikke høy nok opptjening',
        })
      } else if (isError) {
        logger('alert', {
          teskt: 'Beregning avansert: Klarte ikke beregne pensjon',
        })
      }
    }
  }, [formatertUttaksalderReadOnly, isError, alderspensjon])

  React.useEffect(() => {
    if (error && (error as FetchBaseQueryError).status === 503) {
      throw new Error((error as FetchBaseQueryError).data as string)
    }
  }, [error])

  React.useEffect(() => {
    if (!isFetching && alderspensjon && !alderspensjon?.vilkaarErOppfylt) {
      setAvansertSkjemaModus('redigering')
    }
  }, [alderspensjon])

  const [
    isPensjonsavtalerAccordionItemOpen,
    setIslePensjonsavtalerAccordionItem,
  ] = React.useState<boolean>(false)
  /* c8 ignore next 3 */
  const togglePensjonsavtalerAccordionItem = () => {
    setIslePensjonsavtalerAccordionItem((prevState) => !prevState)
  }

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
          hasVilkaarIkkeOppfylt={
            alderspensjon && !alderspensjon?.vilkaarErOppfylt
          }
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
              <PensjonsavtalerAccordionContext.Provider
                value={{
                  ref: grunnlagPensjonsavtalerRef,
                  isOpen: isPensjonsavtalerAccordionItemOpen,
                  toggleOpen: togglePensjonsavtalerAccordionItem,
                }}
              >
                <Simulering
                  isLoading={isFetching}
                  aarligInntektFoerUttakBeloep={
                    aarligInntektFoerUttakBeloep ?? 0
                  }
                  alderspensjon={alderspensjon}
                  showAfp={afp === 'ja_privat'}
                  showButtonsAndTable={
                    !isError && alderspensjon?.vilkaarErOppfylt
                  }
                />
                <ResultatkortAvansertBeregning
                  onButtonClick={() => setAvansertSkjemaModus('redigering')}
                />
                <Grunnlag />
              </PensjonsavtalerAccordionContext.Provider>
            </>
          )}
        </div>
      )}
    </>
  )
}
