import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Alert, Heading } from '@navikt/ds-react'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import clsx from 'clsx'

import { AccordionContext as PensjonsavtalerAccordionContext } from '@/components/common/AccordionItem'
import { Alert as AlertDashBorder } from '@/components/common/Alert'
import { Grunnlag } from '@/components/Grunnlag'
import { Simulering } from '@/components/Simulering'
import { TidligstMuligUttaksalder } from '@/components/TidligstMuligUttaksalder'
import { VelgUttaksalder } from '@/components/VelgUttaksalder'
import {
  useGetPersonQuery,
  apiSlice,
  useAlderspensjonEnkelQuery,
} from '@/state/api/apiSlice'
import { generateAlderspensjonEnkelRequestBody } from '@/state/api/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectSamboer,
  selectCurrentSimulation,
  selectAarligInntektFoerUttak,
  selectAarligInntektFoerUttakFraBrukerInput,
} from '@/state/userInput/selectors'
import { isFoedtFoer1964 } from '@/utils/alder'
import { logger } from '@/utils/logging'

interface Props {
  tidligstMuligUttak?: Alder
}

import styles from './BeregningEnkel.module.scss'

export const BeregningEnkel: React.FC<Props> = ({ tidligstMuligUttak }) => {
  const dispatch = useAppDispatch()

  const grunnlagPensjonsavtalerRef = React.useRef<HTMLSpanElement>(null)
  const harSamboer = useAppSelector(selectSamboer)
  const afp = useAppSelector(selectAfp)
  const aarligInntektFoerUttak = useAppSelector(selectAarligInntektFoerUttak)
  const aarligInntektFoerUttakFraBrukerInput = useAppSelector(
    selectAarligInntektFoerUttakFraBrukerInput
  )

  const { isSuccess: isPersonSuccess, data: person } = useGetPersonQuery()

  const { startAlder } = useAppSelector(selectCurrentSimulation)
  const [alderspensjonEnkelRequestBody, setAlderspensjonEnkelRequestBody] =
    React.useState<AlderspensjonEnkelRequestBody | undefined>(undefined)
  const [showInntektAlert, setShowInntektAlert] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Show alert når: inntekt fra bruker er ikke null (det betyr at brukeren har endret den) og at startAlder er null (betyr at de ble nettopp nullstilt fra GrunnlagInntekt)
    setShowInntektAlert(
      !!aarligInntektFoerUttakFraBrukerInput && startAlder === null
    )
  }, [aarligInntektFoerUttakFraBrukerInput, startAlder])

  React.useEffect(() => {
    if (startAlder) {
      const requestBody = generateAlderspensjonEnkelRequestBody({
        afp,
        sivilstand: person?.sivilstand,
        harSamboer,
        foedselsdato: person?.foedselsdato,
        aarligInntektFoerUttak: aarligInntektFoerUttak ?? 0,
        startAlder,
      })
      setAlderspensjonEnkelRequestBody(requestBody)
    }
  }, [afp, person, aarligInntektFoerUttak, harSamboer, startAlder])

  // Hent alderspensjon + AFP
  const {
    data: alderspensjon,
    isFetching,
    isError,
    error,
  } = useAlderspensjonEnkelQuery(
    alderspensjonEnkelRequestBody as AlderspensjonEnkelRequestBody,
    {
      skip: !alderspensjonEnkelRequestBody,
    }
  )

  React.useEffect(() => {
    if (startAlder !== null) {
      if (alderspensjon && !alderspensjon?.vilkaarErOppfylt) {
        logger('alert', { teskt: 'Beregning: Ikke høy nok opptjening' })
      } else if (isError) {
        logger('alert', { teskt: 'Beregning: Klarte ikke beregne pensjon' })
      }
    }
  }, [startAlder, isError, alderspensjon])

  React.useEffect(() => {
    if (error && (error as FetchBaseQueryError).status === 503) {
      throw new Error((error as FetchBaseQueryError).data as string)
    }
  }, [error])

  const show1963Text = React.useMemo(() => {
    return isPersonSuccess && isFoedtFoer1964(person?.foedselsdato)
  }, [person])

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
    if (alderspensjonEnkelRequestBody) {
      dispatch(
        apiSlice.endpoints.alderspensjonEnkel.initiate(
          alderspensjonEnkelRequestBody
        )
      )
    }
  }
  const dismissAlert = () => {
    setShowInntektAlert(false)
  }

  return (
    <>
      {showInntektAlert && (
        <Alert
          data-testid="alert-inntekt"
          className={styles.alert}
          variant="info"
          closeButton={true}
          onClose={dismissAlert}
        >
          <FormattedMessage id="beregning.alert.inntekt" />
        </Alert>
      )}

      <div className={clsx(styles.background, styles.background__lightgray)}>
        <div className={styles.container}>
          <TidligstMuligUttaksalder
            tidligstMuligUttak={tidligstMuligUttak}
            hasAfpOffentlig={afp === 'ja_offentlig'}
            show1963Text={show1963Text}
          />
        </div>
      </div>

      <div className={styles.container}>
        <VelgUttaksalder tidligstMuligUttak={tidligstMuligUttak} />
      </div>

      {startAlder !== null && (
        <div
          className={`${styles.container} ${styles.container__hasMobilePadding}`}
        >
          {isError || (alderspensjon && !alderspensjon?.vilkaarErOppfylt) ? (
            <>
              <Heading level="2" size="small">
                <FormattedMessage id="beregning.title" />
              </Heading>
              <AlertDashBorder onRetry={isError ? onRetry : undefined}>
                {startAlder && startAlder.aar < 67 && (
                  <FormattedMessage
                    id="beregning.lav_opptjening"
                    values={{ startAar: startAlder.aar }}
                  />
                )}
                {isError && <FormattedMessage id="beregning.error" />}
              </AlertDashBorder>
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
    </>
  )
}
