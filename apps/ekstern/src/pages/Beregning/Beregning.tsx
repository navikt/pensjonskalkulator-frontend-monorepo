import React from 'react'
import { useIntl } from 'react-intl'

import { Heading } from '@navikt/ds-react'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import clsx from 'clsx'

import { AccordionContext } from '@/components/common/AccordionItem'
import { Alert } from '@/components/common/Alert'
import { Loader } from '@/components/common/Loader'
import { Forbehold } from '@/components/Forbehold'
import { Grunnlag } from '@/components/Grunnlag'
import { Simulering } from '@/components/Simulering'
import { TidligstMuligUttaksalder } from '@/components/TidligstMuligUttaksalder'
import { TilbakeEllerAvslutt } from '@/components/TilbakeEllerAvslutt'
import { VelgUttaksalder } from '@/components/VelgUttaksalder'
import {
  apiSlice,
  useAlderspensjonQuery,
  useGetInntektQuery,
  useGetPersonQuery,
  useTidligsteUttaksalderQuery,
} from '@/state/api/apiSlice'
import {
  AlderspensjonRequestBody,
  TidligsteUttaksalderRequestBody,
} from '@/state/api/apiSlice.types'
import { generateAlderspensjonRequestBody } from '@/state/api/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectSamboer,
  selectCurrentSimulation,
  selectFormatertUttaksalder,
} from '@/state/userInput/selectors'

import styles from './Beregning.module.scss'

export function Beregning() {
  const isAlderValgt = useAppSelector(selectFormatertUttaksalder) !== null
  const harSamboer = useAppSelector(selectSamboer)
  const [alderspensjonRequestBody, setAlderspensjonRequestBody] =
    React.useState<AlderspensjonRequestBody | undefined>(undefined)
  const [tidligsteUttaksalderRequestBody, setTidligsteUttaksalderRequestBody] =
    React.useState<TidligsteUttaksalderRequestBody | undefined>(undefined)
  const [
    isPensjonsavtalerAccordionItemOpen,
    setIslePensjonsavtalerAccordionItem,
  ] = React.useState<boolean>(false)
  const grunnlagPensjonsavtalerRef = React.useRef<HTMLSpanElement>(null)
  /* c8 ignore next 3 */
  const togglePensjonsavtalerAccordionItem = () => {
    setIslePensjonsavtalerAccordionItem((prevState) => !prevState)
  }

  const { data: person } = useGetPersonQuery()
  const { data: inntekt, isError: isInntektError } = useGetInntektQuery()
  const afp = useAppSelector(selectAfp)
  const { startAar, startMaaned, uttaksgrad } = useAppSelector(
    selectCurrentSimulation
  )

  const intl = useIntl()
  const dispatch = useAppDispatch()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.beregning',
    })
  }, [])

  React.useEffect(() => {
    const requestBody = generateAlderspensjonRequestBody({
      afp,
      sivilstand: person?.sivilstand,
      harSamboer,
      inntekt,
      foedselsdato: person?.foedselsdato,
      startAlder: startAar,
      startMaaned: startMaaned,
      uttaksgrad: uttaksgrad,
    })
    setAlderspensjonRequestBody(requestBody)
  }, [afp, person, inntekt, harSamboer, startAar, startMaaned, uttaksgrad])

  React.useEffect(() => {
    setTidligsteUttaksalderRequestBody({
      sivilstand: person?.sivilstand,
      harEps: harSamboer !== null ? harSamboer : undefined,
      sisteInntekt: inntekt?.beloep,
      simuleringstype:
        afp === 'ja_privat' ? 'ALDERSPENSJON_MED_AFP_PRIVAT' : 'ALDERSPENSJON',
    })
  }, [afp, person, inntekt, harSamboer])

  // Hent tidligst mulig uttaksalder
  const {
    data: tidligstMuligUttak,
    isLoading: isTidligstMuligUttaksalderLoading,
    isError: isTidligstMuligUttaksalderError,
  } = useTidligsteUttaksalderQuery(tidligsteUttaksalderRequestBody, {
    skip: !tidligsteUttaksalderRequestBody,
  })

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
    if (error && (error as FetchBaseQueryError).status === 503) {
      throw new Error((error as FetchBaseQueryError).data as string)
    }
  }, [error])

  const onRetry = (): void => {
    dispatch(apiSlice.util.invalidateTags(['Alderspensjon']))
    if (alderspensjonRequestBody) {
      dispatch(
        apiSlice.endpoints.alderspensjon.initiate(alderspensjonRequestBody)
      )
    }
  }

  if (isTidligstMuligUttaksalderLoading) {
    return (
      <Loader
        data-testid="uttaksalder-loader"
        size="3xlarge"
        title="Et øyeblikk, vi henter tidligste mulige uttaksalder"
      />
    )
  }

  return (
    <>
      {!isTidligstMuligUttaksalderError && tidligstMuligUttak && (
        <div className={styles.container}>
          <TidligstMuligUttaksalder
            tidligstMuligUttak={tidligstMuligUttak}
            hasAfpOffentlig={afp === 'ja_offentlig'}
          />
        </div>
      )}
      <div
        className={clsx(styles.background, styles.background__hasMargin, {
          [styles.background__white]: isAlderValgt,
        })}
      >
        <div className={styles.container}>
          <VelgUttaksalder tidligstMuligUttak={tidligstMuligUttak} />
        </div>
        {
          // TODO PEK-107 - sørge for at fokuset flyttes riktig og at skjermleseren leser opp i riktig rekkefølge etter valg av uttaksalder + at lasting er ferdig.
        }
        {isAlderValgt && (
          <div
            className={`${styles.container} ${styles.container__hasPadding}`}
          >
            {isError ||
            isInntektError ||
            (alderspensjon && !alderspensjon?.vilkaarErOppfylt) ? (
              <>
                <Heading level="2" size="small">
                  Beregning
                </Heading>
                <Alert onRetry={isError ? onRetry : undefined}>
                  {isError
                    ? 'Vi klarte dessverre ikke å beregne pensjonen din akkurat nå'
                    : `Du har ikke høy nok opptjening til å kunne starte uttak ved ${startAar} år. Prøv en høyere alder.`}
                </Alert>
              </>
            ) : (
              <>
                <AccordionContext.Provider
                  value={{
                    ref: grunnlagPensjonsavtalerRef,
                    isOpen: isPensjonsavtalerAccordionItemOpen,
                    toggleOpen: togglePensjonsavtalerAccordionItem,
                  }}
                >
                  {
                    // Inntekt kan ikke være undefined her fordi feil fanges på Steg 1 allerede
                  }
                  <Simulering
                    isLoading={isFetching}
                    inntekt={inntekt as Inntekt}
                    alderspensjon={alderspensjon}
                    showAfp={afp === 'ja_privat'}
                    showButtonsAndTable={
                      !isError && alderspensjon?.vilkaarErOppfylt
                    }
                  />
                  <Grunnlag
                    inntekt={inntekt as Inntekt}
                    tidligstMuligUttak={tidligstMuligUttak}
                  />
                  <Forbehold />
                </AccordionContext.Provider>
              </>
            )}
          </div>
        )}
      </div>
      <div className={`${styles.background} ${styles.background__lightblue}`}>
        <div className={styles.container}>
          <TilbakeEllerAvslutt />
        </div>
      </div>
    </>
  )
}
