import React from 'react'
import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router'

import { PencilIcon } from '@navikt/aksel-icons'
import { Button, Heading } from '@navikt/ds-react'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import clsx from 'clsx'

import { Alert as AlertDashBorder } from '@/components/common/Alert'
import { Grunnlag } from '@/components/Grunnlag'
import { GrunnlagForbehold } from '@/components/GrunnlagForbehold'
import { InfoOmLoependeVedtak } from '@/components/InfoOmLoependeVedtak'
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
  selectIsEndring,
  selectLoependeVedtak,
  selectNedreAldersgrense,
} from '@/state/userInput/selectors'
import {
  getAlderMinus1Maaned,
  getAlderPlus1Maaned,
  isAlderOverMinUttaksalder,
  transformFoedselsdatoToAlderMinus1md,
} from '@/utils/alder'
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
  const isEndring = useAppSelector(selectIsEndring)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
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
        loependeVedtak,
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

  const brukerensAlderPlus1Maaned = React.useMemo(() => {
    const brukerensAlder = person
      ? transformFoedselsdatoToAlderMinus1md(person.foedselsdato)
      : getAlderMinus1Maaned(useAppSelector(selectNedreAldersgrense))
    const beregnetMinAlder = getAlderPlus1Maaned(brukerensAlder)
    return isAlderOverMinUttaksalder(beregnetMinAlder)
      ? beregnetMinAlder
      : useAppSelector(selectNedreAldersgrense)
  }, [person])

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
          brukerensAlderPlus1Maaned={brukerensAlderPlus1Maaned}
        />
      )}

      {avansertSkjemaModus === 'resultat' && (
        <>
          <InfoOmLoependeVedtak loependeVedtak={loependeVedtak} />
          <div
            className={`${styles.container} ${styles.container__hasMobilePadding} ${styles.container__hasTopMargin}`}
          >
            {isError ? (
              <>
                <Heading level="2" size="small">
                  <FormattedMessage id="beregning.title" />
                </Heading>
                <AlertDashBorder onRetry={isError ? onRetry : undefined}>
                  {isError && <FormattedMessage id="beregning.error" />}
                </AlertDashBorder>
                <ResultatkortAvansertBeregning
                  onButtonClick={() => setAvansertSkjemaModus('redigering')}
                />
              </>
            ) : (
              <>
                <Button
                  type="button"
                  data-testid="card-button-secondary"
                  className={styles.button}
                  variant="secondary"
                  icon={<PencilIcon aria-hidden />}
                  onClick={() => {
                    logger('button klikk', {
                      tekst: 'Beregning avansert: Endre valgene dine',
                    })
                    setAvansertSkjemaModus('redigering')
                  }}
                >
                  <FormattedMessage id="beregning.avansert.button.endre_valgene_dine" />
                </Button>
                <Simulering
                  isLoading={isFetching}
                  headingLevel="2"
                  aarligInntektFoerUttakBeloep={
                    aarligInntektFoerUttakBeloep ?? '0'
                  }
                  alderspensjonListe={alderspensjon?.alderspensjon}
                  afpPrivatListe={
                    !loependeVedtak.ufoeretrygd.grad &&
                    (afp === 'ja_privat' || loependeVedtak.afpPrivat) &&
                    alderspensjon?.afpPrivat
                      ? alderspensjon?.afpPrivat
                      : undefined
                  }
                  afpOffentligListe={
                    !loependeVedtak.ufoeretrygd.grad &&
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
                <ResultatkortAvansertBeregning
                  onButtonClick={() => setAvansertSkjemaModus('redigering')}
                />
                {!isEndring && <Pensjonsavtaler headingLevel="2" />}
                <Grunnlag
                  visning="avansert"
                  headingLevel="2"
                  harForLiteTrygdetid={alderspensjon?.harForLiteTrygdetid}
                />
              </>
            )}
          </div>
          {!isError && (
            <>
              <div
                className={clsx(
                  styles.background,
                  styles.background__lightblue
                )}
              >
                <div className={styles.container}>
                  <SavnerDuNoe headingLevel="3" isEndring={isEndring} />
                </div>
              </div>
              <div className={styles.container}>
                <GrunnlagForbehold headingLevel="3" />
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}
