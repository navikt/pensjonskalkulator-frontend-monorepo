import clsx from 'clsx'
import { sl } from 'date-fns/locale'
import type {
  SeriesColumnOptions,
  SeriesOptionsType,
  XAxisOptions,
} from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { HandFingerIcon } from '@navikt/aksel-icons'
import type { HeadingProps } from '@navikt/ds-react'
import { BodyLong, BodyShort, Heading } from '@navikt/ds-react'

import { TabellVisning } from '@/components/TabellVisning'
import { usePdfView } from '@/pdf-view/hooks'
import {
  useGetAfpOffentligLivsvarigQuery,
  usePensjonsavtalerQuery,
} from '@/state/api/apiSlice'
import { isOffentligTpFoer1963 } from '@/state/api/typeguards'
import { generatePensjonsavtalerRequestBody } from '@/state/api/utils'
import { useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectAfpUtregningValg,
  selectCurrentSimulation,
  selectEpsHarInntektOver2G,
  selectEpsHarPensjon,
  selectErApoteker,
  selectFoedselsdato,
  selectIsEndring,
  selectSamtykke,
  selectSamtykkeOffentligAFP,
  selectSivilstand,
  selectSkalBeregneAfpKap19,
  selectUfoeregrad,
  selectUtenlandsperioder,
} from '@/state/userInput/selectors'
import { isAlderOver62 } from '@/utils/alder'
import { formatInntektToNumber } from '@/utils/inntekt'

import { useOppholdUtenforNorge } from '../Grunnlag/GrunnlagUtenlandsopphold/hooks'
import { Graph } from './Graph'
import { MaanedsbeloepAvansertBeregning } from './MaanedsbeloepAvansertBeregning'
import { SimuleringAfpOffentligAlert } from './SimuleringAfpOffentligAlert/SimuleringAfpOffentligAlert'
import { SimuleringEndringBanner } from './SimuleringEndringBanner/SimuleringEndringBanner'
import { SimuleringGrafNavigation } from './SimuleringGrafNavigation/SimuleringGrafNavigation'
import { SimuleringPensjonsavtalerAlert } from './SimuleringPensjonsavtalerAlert/SimuleringPensjonsavtalerAlert'
import { SERIES_DEFAULT } from './constants'
import {
  type SeriesConfig,
  mergeAarligUtbetalinger,
  parseStartSluttUtbetaling,
} from './data/data'
import { useOffentligTpData } from './hooks'

import styles from './Simulering.module.scss'

interface Props {
  isLoading: boolean
  headingLevel: HeadingProps['level']
  aarligInntektFoerUttakBeloep: string
  alderspensjonListe?: AlderspensjonPensjonsberegning[]
  afpPrivatListe?: AfpPrivatPensjonsberegning[]
  pre2025OffentligAfp?: AfpEtterfulgtAvAlderspensjon
  afpOffentligListe?: AfpPensjonsberegning[]
  alderspensjonMaanedligVedEndring?: AlderspensjonMaanedligVedEndring
  showButtonsAndTable?: boolean
  detaljer?: {
    trygdetid?: number
    opptjeningsgrunnlag?: SimulertOpptjeningGrunnlag[]
    harForLiteTrygdetid?: boolean
  }
  visning?: BeregningVisning
}

export const Simulering = ({
  isLoading,
  headingLevel,
  aarligInntektFoerUttakBeloep,
  alderspensjonListe,
  pre2025OffentligAfp,
  afpPrivatListe,
  afpOffentligListe,
  alderspensjonMaanedligVedEndring,
  detaljer,
  showButtonsAndTable,
  visning,
}: Props) => {
  const harSamtykket = useAppSelector(selectSamtykke)
  const ufoeregrad = useAppSelector(selectUfoeregrad)
  const afp = useAppSelector(selectAfp)
  const sivilstand = useAppSelector(selectSivilstand)
  const foedselsdato = useAppSelector(selectFoedselsdato)
  const isEndring = useAppSelector(selectIsEndring)
  const epsHarPensjon = useAppSelector(selectEpsHarPensjon)
  const epsHarInntektOver2G = useAppSelector(selectEpsHarInntektOver2G)
  const erApoteker = useAppSelector(selectErApoteker)
  const { uttaksalder, aarligInntektVsaHelPensjon, gradertUttaksperiode } =
    useAppSelector(selectCurrentSimulation)
  const skalBeregneAfpKap19 = useAppSelector(selectSkalBeregneAfpKap19)
  const intl = useIntl()

  const [offentligTpRequestBody, setOffentligTpRequestBody] = useState<
    OffentligTpRequestBody | undefined
  >(undefined)
  const utenlandsperioder = useAppSelector(selectUtenlandsperioder)

  const samtykkeOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const afpUtregningValg = useAppSelector(selectAfpUtregningValg)
  const { beregningsvalg } = useAppSelector(selectCurrentSimulation)
  const oppholdUtenforNorge = useOppholdUtenforNorge({
    harForLiteTrygdetid: detaljer?.harForLiteTrygdetid,
  })
  const chartRef = useRef<HighchartsReact.RefObject>(null)

  const [pensjonsavtalerRequestBody, setPensjonsavtalerRequestBody] = useState<
    PensjonsavtalerRequestBody | undefined
  >(undefined)

  const {
    data: offentligTp,
    isLoading: isOffentligTpLoading,
    isError: isOffentligTpError,
    afpPerioder,
    erOffentligTpFoer1963,
    tpAfpPeriode,
    erSpkBesteberegning,
  } = useOffentligTpData()

  const {
    data: pensjonsavtalerData,
    isFetching: isPensjonsavtalerLoading,
    isSuccess: isPensjonsavtalerSuccess,
    isError: isPensjonsavtalerError,
  } = usePensjonsavtalerQuery(
    pensjonsavtalerRequestBody as PensjonsavtalerRequestBody,
    {
      skip: !pensjonsavtalerRequestBody || !harSamtykket || !uttaksalder,
    }
  )

  const harSamtykketOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const {
    isSuccess: isAfpOffentligLivsvarigSuccess,
    data: loependeLivsvarigAfpOffentlig,
  } = useGetAfpOffentligLivsvarigQuery(undefined, {
    skip:
      !harSamtykketOffentligAFP ||
      !foedselsdato ||
      !isAlderOver62(foedselsdato),
  })

  // Calculate the start age for the x-axis
  // If gradual withdrawal exists, start from the year before; otherwise use standard logic

  const graphData: SeriesConfig[] = useMemo(
    () => [
      {
        name: intl.formatMessage({ id: SERIES_DEFAULT.SERIE_INNTEKT.name }),
        color: SERIES_DEFAULT.SERIE_INNTEKT.color,
        data: uttaksalder
          ? (() => {
              const pensjonStartAlder = isEndring
                ? {
                    aar:
                      alderspensjonListe && alderspensjonListe.length > 0
                        ? alderspensjonListe[0].alder
                        : uttaksalder.aar,
                    maaneder: 0,
                  }
                : gradertUttaksperiode?.uttaksalder || uttaksalder

              // Period 1: Income before withdrawal
              // Førstegangssøknad: starts 1 year before pension
              // Endring: starts from pension year
              // sluttAlder: ends just before the user's chosen uttaksalder (or gradual withdrawal start)
              const userChosenStartAlder =
                gradertUttaksperiode?.uttaksalder || uttaksalder

              const inntektFoerUttak = aarligInntektFoerUttakBeloep
                ? parseStartSluttUtbetaling({
                    startAlder: {
                      aar: isEndring
                        ? pensjonStartAlder.aar
                        : pensjonStartAlder.aar - 1,
                      maaneder: 0,
                    },
                    sluttAlder:
                      userChosenStartAlder.maaneder === 0
                        ? {
                            aar: userChosenStartAlder.aar - 1,
                            maaneder: 11,
                          }
                        : {
                            aar: userChosenStartAlder.aar,
                            maaneder: userChosenStartAlder.maaneder - 1,
                          },
                    aarligUtbetaling: formatInntektToNumber(
                      aarligInntektFoerUttakBeloep
                    ),
                  })
                : []

              // Period 2: Income during gradual withdrawal (ends when full pension starts)
              const inntektVedGradertUttak =
                gradertUttaksperiode?.uttaksalder &&
                gradertUttaksperiode?.aarligInntektVsaPensjonBeloep
                  ? parseStartSluttUtbetaling({
                      startAlder: gradertUttaksperiode.uttaksalder,
                      sluttAlder:
                        uttaksalder.maaneder === 0
                          ? {
                              aar: uttaksalder.aar - 1,
                              maaneder: 11,
                            }
                          : {
                              aar: uttaksalder.aar,
                              maaneder: uttaksalder.maaneder - 1,
                            },
                      aarligUtbetaling: formatInntektToNumber(
                        gradertUttaksperiode.aarligInntektVsaPensjonBeloep
                      ),
                    })
                  : []

              // Period 3: Income during full pension (starts after gradual withdrawal ends, if any)
              const inntektVedHelPensjon = aarligInntektVsaHelPensjon?.beloep
                ? parseStartSluttUtbetaling({
                    startAlder: uttaksalder,
                    sluttAlder:
                      aarligInntektVsaHelPensjon.sluttAlder.maaneder === 0
                        ? {
                            aar: aarligInntektVsaHelPensjon.sluttAlder.aar - 1,
                            maaneder: 11,
                          }
                        : {
                            aar: aarligInntektVsaHelPensjon.sluttAlder.aar,
                            maaneder:
                              aarligInntektVsaHelPensjon.sluttAlder.maaneder -
                              1,
                          },
                    aarligUtbetaling: formatInntektToNumber(
                      aarligInntektVsaHelPensjon.beloep
                    ),
                  })
                : []

              return mergeAarligUtbetalinger([
                inntektFoerUttak,
                inntektVedGradertUttak,
                inntektVedHelPensjon,
              ])
            })()
          : [],
      },
      {
        name: intl.formatMessage({
          id: SERIES_DEFAULT.SERIE_AFP.name,
        }),
        color: SERIES_DEFAULT.SERIE_AFP.color,
        data: mergeAarligUtbetalinger([
          (() => {
            if (pre2025OffentligAfp) {
              const harSpkPerioder = Boolean(afpPerioder?.length)
              if (harSpkPerioder) {
                return parseStartSluttUtbetaling({
                  startAlder: {
                    aar: pre2025OffentligAfp.alderAar,
                    maaneder: 0,
                  },
                  sluttAlder: { aar: 64, maaneder: 11 },
                  aarligUtbetaling: pre2025OffentligAfp.totaltAfpBeloep * 12,
                })
              }

              return parseStartSluttUtbetaling({
                startAlder: { aar: pre2025OffentligAfp.alderAar, maaneder: 0 },
                sluttAlder: { aar: 66, maaneder: 11 },
                aarligUtbetaling: pre2025OffentligAfp.totaltAfpBeloep * 12,
              })
            }

            if (afpOffentligListe && afpOffentligListe.length > 0) {
              return afpOffentligListe.length === 1
                ? parseStartSluttUtbetaling({
                    startAlder: {
                      aar: afpOffentligListe[0].alder,
                      maaneder: 0,
                    },
                    aarligUtbetaling: afpOffentligListe[0].beloep,
                  })
                : [
                    {
                      alder: afpOffentligListe[0].alder,
                      beloep: afpOffentligListe[0].beloep,
                    },
                    {
                      alder: Infinity,
                      beloep: afpOffentligListe[1].beloep,
                    },
                  ]
            }

            return []
          })(),
          afpPerioder
            ? afpPerioder.flatMap((periode) =>
                periode.startAlder.aar >= 65
                  ? parseStartSluttUtbetaling({
                      startAlder: periode.startAlder,
                      sluttAlder: periode.sluttAlder
                        ? periode.sluttAlder.maaneder === 0
                          ? {
                              aar: periode.sluttAlder.aar - 1,
                              maaneder: 11,
                            }
                          : {
                              aar: periode.sluttAlder.aar,
                              maaneder: periode.sluttAlder.maaneder - 1,
                            }
                        : undefined,
                      aarligUtbetaling: periode.aarligUtbetaling,
                    })
                  : []
              )
            : [],
          afpPrivatListe ?? [],
        ]),
      },
      {
        name: intl.formatMessage({ id: SERIES_DEFAULT.SERIE_TP.name }),
        color: SERIES_DEFAULT.SERIE_TP.color,
        data: (() => {
          const privatePensjonsParsed = (
            pensjonsavtalerData?.avtaler ?? []
          ).flatMap((avtale) =>
            avtale.utbetalingsperioder.map((periode) =>
              parseStartSluttUtbetaling({
                startAlder: periode.startAlder,
                sluttAlder: periode.sluttAlder,
                aarligUtbetaling: periode.aarligUtbetaling,
              })
            )
          )

          const offentligTpParsed = (
            offentligTp?.simulertTjenestepensjon?.simuleringsresultat
              .utbetalingsperioder ?? []
          ).map((periode) =>
            parseStartSluttUtbetaling({
              startAlder: periode.startAlder,
              sluttAlder: periode.sluttAlder,
              aarligUtbetaling: periode.aarligUtbetaling,
            })
          )

          return mergeAarligUtbetalinger([
            ...privatePensjonsParsed,
            ...offentligTpParsed,
          ])
        })(),
      },
      {
        name: intl.formatMessage({
          id: SERIES_DEFAULT.SERIE_ALDERSPENSJON.name,
        }),
        color: SERIES_DEFAULT.SERIE_ALDERSPENSJON.color,
        data:
          alderspensjonListe && alderspensjonListe.length > 0
            ? [
                ...alderspensjonListe.map((it) => ({
                  alder: it.alder,
                  beloep: it.beloep,
                })),
                // Alderspensjon fra Nav er livsvarig
                {
                  alder: Infinity,
                  beloep:
                    alderspensjonListe[alderspensjonListe.length - 1].beloep,
                },
              ]
            : [],
      },
    ],
    [
      intl,
      isEndring,
      uttaksalder,
      gradertUttaksperiode,
      aarligInntektFoerUttakBeloep,
      aarligInntektVsaHelPensjon,
      afpOffentligListe,
      afpPrivatListe,
      pensjonsavtalerData?.avtaler,
      offentligTp?.simulertTjenestepensjon?.simuleringsresultat
        .utbetalingsperioder,
      alderspensjonListe,
    ]
  )

  useEffect(() => {
    if (harSamtykket && uttaksalder) {
      setPensjonsavtalerRequestBody(
        generatePensjonsavtalerRequestBody({
          ufoeregrad,
          afp,
          sivilstand,
          epsHarPensjon,
          epsHarInntektOver2G,
          aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
          gradertUttak: gradertUttaksperiode ?? undefined,
          heltUttak: {
            uttaksalder,
            aarligInntektVsaPensjon: aarligInntektVsaHelPensjon,
          },
          skalBeregneAfpKap19,
        })
      )
    }
  }, [
    harSamtykket,
    uttaksalder,
    gradertUttaksperiode,
    aarligInntektFoerUttakBeloep,
    aarligInntektVsaHelPensjon,
    epsHarInntektOver2G,
    utenlandsperioder,
    sivilstand,
    epsHarPensjon,
    afp,
    ufoeregrad,
    erApoteker,
    foedselsdato,
    skalBeregneAfpKap19,
  ])

  const [showVisFaerreAarButton, setShowVisFaerreAarButton] = useState(false)
  const [showVisFlereAarButton, setShowVisFlereAarButton] = useState(false)
  const [tableXAxis, setTableXAxis] = useState<string[]>([])
  const [tableSeries, setTableSeries] = useState<SeriesOptionsType[]>([])

  const handleButtonVisibilityChange = useCallback(
    (state: {
      showVisFaerreAarButton: boolean
      showVisFlereAarButton: boolean
    }) => {
      setShowVisFaerreAarButton(state.showVisFaerreAarButton)
      setShowVisFlereAarButton(state.showVisFlereAarButton)
    },
    []
  )

  const handleSeriesDataChange = useCallback(
    (xAxis: string[], series: SeriesOptionsType[]) => {
      setTableXAxis(xAxis)
      setTableSeries(series)
    },
    []
  )

  const isPensjonsavtaleFlagVisible =
    (pensjonsavtalerData?.partialResponse ||
      (!isOffentligTpFoer1963(offentligTp) &&
        offentligTp?.simulertTjenestepensjon?.simuleringsresultat
          ?.betingetTjenestepensjonErInkludert)) ??
    false

  // const { data: person } = useGetPersonQuery()
  const isEnkel = visning === 'enkel'

  // usePdfView({
  //   headingLevel,
  //   alderspensjonListe,
  //   pre2025OffentligAfp,
  //   afpPrivatListe,
  //   afpOffentligListe,
  //   detaljer,
  //   visning,
  //   chartOptions,
  //   pensjonsavtalerData,
  //   isPensjonsavtalerSuccess,
  //   isPensjonsavtalerError,
  //   isLoading: isLoading || isOffentligTpLoading || isPensjonsavtalerLoading,
  //   isPensjonsavtaleFlagVisible,
  //   erOffentligTpFoer1963,
  //   tpAfpPeriode,
  //   erSpkBesteberegning,
  // })

  const hideAFP =
    loependeLivsvarigAfpOffentlig?.afpStatus &&
    (loependeLivsvarigAfpOffentlig?.maanedligBeloep === null ||
      loependeLivsvarigAfpOffentlig?.maanedligBeloep === undefined)

  return (
    <section className={styles.section}>
      {!isEndring && (
        <div className={clsx({ [styles.intro]: isEnkel })}>
          <Heading
            className={clsx({ [styles.introTitle]: isEnkel })}
            level={headingLevel}
            size={headingLevel === '2' ? 'medium' : 'small'}
            data-testid="beregning-title"
          >
            <FormattedMessage id="beregning.highcharts.title" />
          </Heading>

          {isEnkel && (
            <BodyLong>
              <FormattedMessage id="beregning.highcharts.ingress" />
            </BodyLong>
          )}
        </div>
      )}

      {showButtonsAndTable && (
        <SimuleringEndringBanner
          isLoading={isLoading}
          heltUttaksalder={uttaksalder}
          gradertUttaksperiode={gradertUttaksperiode ?? undefined}
          alderspensjonMaanedligVedEndring={alderspensjonMaanedligVedEndring}
        />
      )}

      <div role="img" aria-labelledby="alt-chart-title">
        <div id="alt-chart-title" hidden>
          <FormattedMessage id="beregning.highcharts.alt_tekst" />
        </div>

        <div
          className={styles.highchartsWrapper}
          data-testid="highcharts-aria-wrapper"
          aria-hidden={true}
        >
          <Graph
            data={graphData}
            isLoading={isLoading}
            isPensjonsavtalerLoading={isPensjonsavtalerLoading}
            isOffentligTpLoading={isOffentligTpLoading}
            onButtonVisibilityChange={handleButtonVisibilityChange}
            onSeriesDataChange={handleSeriesDataChange}
          />

          {showButtonsAndTable && (
            <BodyShort
              size="small"
              textColor="subtle"
              className={styles.infoClick}
            >
              <HandFingerIcon />
              <FormattedMessage id="beregning.highcharts.informasjon_klikk" />
            </BodyShort>
          )}
        </div>
      </div>

      {showButtonsAndTable && (
        <SimuleringGrafNavigation
          showVisFaerreAarButton={showVisFaerreAarButton}
          showVisFlereAarButton={showVisFlereAarButton}
        />
      )}

      <SimuleringPensjonsavtalerAlert
        isPensjonsavtaleFlagVisible={isPensjonsavtaleFlagVisible}
        pensjonsavtaler={{
          isLoading: isPensjonsavtalerLoading,
          isError: isPensjonsavtalerError,
          isSuccess: isPensjonsavtalerSuccess,
          data: pensjonsavtalerData,
        }}
        offentligTp={{
          isError: isOffentligTpError,
          data: offentligTp,
        }}
        erOffentligTpFoer1963={erOffentligTpFoer1963}
      />

      <SimuleringAfpOffentligAlert
        harSamtykketOffentligAFP={harSamtykketOffentligAFP}
        isAfpOffentligLivsvarigSuccess={isAfpOffentligLivsvarigSuccess}
        loependeLivsvarigAfpOffentlig={loependeLivsvarigAfpOffentlig}
      />

      {showButtonsAndTable && (
        <TabellVisning
          series={tableSeries as SeriesColumnOptions[]}
          aarArray={tableXAxis}
        />
      )}

      {/* c8 ignore next 6 - detaljer skal kun vises i dev for test formål */}
      {/* {utvidetSimuleringsresultatFeatureToggle?.enabled && detaljer && (
        <Simuleringsdetaljer
          alderspensjonListe={alderspensjonListe}
          detaljer={detaljer}
          pre2025OffentligAfp={pre2025OffentligAfp}
        />
      )} */}

      {!isOffentligTpLoading &&
        !isLoading &&
        !isPensjonsavtalerLoading &&
        !isEndring &&
        visning === 'avansert' && (
          <MaanedsbeloepAvansertBeregning
            alderspensjonMaanedligVedEndring={alderspensjonMaanedligVedEndring}
            afpPrivatListe={afpPrivatListe}
            afpOffentligListe={hideAFP ? undefined : afpOffentligListe}
            pre2025OffentligAfp={pre2025OffentligAfp}
            offentligAfpFraTpOrdning={afpPerioder}
            pensjonsavtaler={pensjonsavtalerData?.avtaler}
            simulertTjenestepensjon={offentligTp?.simulertTjenestepensjon}
            erTpFoer1963={
              offentligTp &&
              erOffentligTpFoer1963 &&
              isOffentligTpFoer1963(offentligTp) &&
              (skalBeregneAfpKap19 ?? false)
            }
            skalViseNullOffentligTjenestepensjon={
              isOffentligTpFoer1963(offentligTp) &&
              offentligTp?.feilkode === 'BEREGNING_GIR_NULL_UTBETALING'
            }
          />
        )}
    </section>
  )
}
