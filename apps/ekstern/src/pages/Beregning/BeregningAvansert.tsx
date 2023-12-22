import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { PencilIcon } from '@navikt/aksel-icons'
import { Button, Heading } from '@navikt/ds-react'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import clsx from 'clsx'

import { AccordionContext as PensjonsavtalerAccordionContext } from '@/components/common/AccordionItem'
import { Alert } from '@/components/common/Alert'
import { Grunnlag } from '@/components/Grunnlag'
import { RedigerAvansertBeregning } from '@/components/RedigerAvansertBeregning'
import { Simulering } from '@/components/Simulering'
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
  selectFormatertUttaksalder,
  selectAarligInntektFoerUttak,
} from '@/state/userInput/selectors'
import { logger } from '@/utils/logging'

import styles from './BeregningAvansert.module.scss'

type Modus = 'redigering' | 'resultat'

export const BeregningAvansert: React.FC = () => {
  const dispatch = useAppDispatch()
  const intl = useIntl()
  const [modus, setModus] = React.useState<Modus>('redigering')

  const grunnlagPensjonsavtalerRef = React.useRef<HTMLSpanElement>(null)
  const harSamboer = useAppSelector(selectSamboer)
  const afp = useAppSelector(selectAfp)
  const aarligInntektFoerUttak = useAppSelector(selectAarligInntektFoerUttak)
  const isAlderValgt = useAppSelector(selectFormatertUttaksalder) !== null
  const { data: person } = useGetPersonQuery()

  const { startAar, startMaaned, uttaksgrad } = useAppSelector(
    selectCurrentSimulation
  )
  const [alderspensjonRequestBody, setAlderspensjonRequestBody] =
    React.useState<AlderspensjonRequestBody | undefined>(undefined)

  React.useEffect(() => {
    const requestBody = generateAlderspensjonRequestBody({
      afp,
      sivilstand: person?.sivilstand,
      harSamboer,
      foedselsdato: person?.foedselsdato,
      aarligInntektFoerUttak: aarligInntektFoerUttak ?? 0,
      startAlder: startAar,
      startMaaned,
      uttaksgrad,
    })
    setAlderspensjonRequestBody(requestBody)
  }, [
    afp,
    person,
    aarligInntektFoerUttak,
    harSamboer,
    startAar,
    startMaaned,
    uttaksgrad,
  ])

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
    if (isAlderValgt) {
      if (alderspensjon && !alderspensjon?.vilkaarErOppfylt) {
        logger('alert', { teskt: 'Beregning: Ikke høy nok opptjening' })
      } else if (isError) {
        logger('alert', { teskt: 'Beregning: Klarte ikke beregne pensjon' })
      }
    }
  }, [isAlderValgt, isError, alderspensjon])

  React.useEffect(() => {
    if (error && (error as FetchBaseQueryError).status === 503) {
      throw new Error((error as FetchBaseQueryError).data as string)
    }
  }, [error])

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
      {modus === 'redigering' && (
        <RedigerAvansertBeregning
          onSubmitSuccess={() => {
            setModus('resultat')
          }}
        />
      )}
      {modus === 'resultat' && (
        <div
          className={`${styles.container} ${styles.container__hasMobilePadding}`}
        >
          <div className={styles.card}>
            <div className={styles.cardLeft}>
              <p>avansert visning</p>
            </div>
            <div className={styles.cardRight}>
              <Button
                // className={styles.button}
                variant="tertiary"
                icon={<PencilIcon aria-hidden />}
                onClick={() => {
                  setModus('redigering')
                }}
              >
                {intl.formatMessage({
                  id: 'beregning.avansert.resultatkort.button',
                })}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={clsx(styles.background, styles.background__white)}>
        <div className={styles.container}>
          {/* <VelgUttaksalder tidligstMuligUttak={tidligstMuligUttak} /> */}
        </div>

        {modus === 'resultat' && (
          <div
            className={`${styles.container} ${styles.container__hasMobilePadding}`}
          >
            {isError || (alderspensjon && !alderspensjon?.vilkaarErOppfylt) ? (
              <>
                <Heading level="2" size="small">
                  <FormattedMessage id="beregning.title" />
                </Heading>
                <Alert onRetry={isError ? onRetry : undefined}>
                  {startAar && startAar < 67 && (
                    <FormattedMessage
                      id="beregning.lav_opptjening"
                      values={{ startAar }}
                    />
                  )}
                  {isError && <FormattedMessage id="beregning.error" />}
                </Alert>
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
                    aarligInntektFoerUttak={aarligInntektFoerUttak ?? 0}
                    alderspensjon={alderspensjon}
                    showAfp={afp === 'ja_privat'}
                    showButtonsAndTable={
                      !isError && alderspensjon?.vilkaarErOppfylt
                    }
                  />
                  <Grunnlag />
                </PensjonsavtalerAccordionContext.Provider>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
