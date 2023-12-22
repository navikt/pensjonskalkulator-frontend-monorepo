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
import { formatWithoutDecimal } from '@/utils/currency'
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

  const formatertUttaksalder = useAppSelector(selectFormatertUttaksalder)
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
    if (formatertUttaksalder) {
      if (alderspensjon && !alderspensjon?.vilkaarErOppfylt) {
        logger('alert', { teskt: 'Beregning: Ikke høy nok opptjening' })
      } else if (isError) {
        logger('alert', { teskt: 'Beregning: Klarte ikke beregne pensjon' })
      }
    }
  }, [formatertUttaksalder, isError, alderspensjon])

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
      {
        // TODO flytte dette til en ny komponent ResultatKort
      }
      {modus === 'resultat' && (
        <div
          className={`${styles.container} ${styles.container__hasMobilePadding}`}
        >
          <div className={styles.card}>
            <div className={styles.cardLeft}>
              <dl className={styles.cardLeftList}>
                <dt className={styles.cardLeftListTitle}>
                  Frem til uttak av pensjon
                </dt>
                <dd className={styles.cardLeftListDescription}>
                  Inntekt: {formatWithoutDecimal(aarligInntektFoerUttak)} kr/år
                  før skatt
                </dd>
                <dt className={styles.cardLeftListTitle}>
                  Fra {formatertUttaksalder} til livsarig.
                </dt>
                <dd className={styles.cardLeftListDescription}>
                  Alderspensjon 100 %<br />
                  Inntekt: {formatWithoutDecimal(aarligInntektFoerUttak)} kr/år
                  før skatt
                </dd>
                <dt className={styles.cardLeftListTitle}>avansert visning</dt>
                <dd className={styles.cardLeftListDescription}>
                  Lorem ipsum dolor sit amet
                </dd>
              </dl>
            </div>
            <div className={styles.cardRight}>
              <Button
                className={styles.cardRightButton}
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
        {modus === 'resultat' && (
          <div
            className={`${styles.container} ${styles.container__hasMobilePadding} ${styles.container__hasTopMargin}`}
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
