import clsx from 'clsx'
import type { SeriesColumnOptions, SeriesOptionsType } from 'highcharts'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { HandFingerIcon } from '@navikt/aksel-icons'
import type { HeadingProps } from '@navikt/ds-react'
import { BodyLong, BodyShort, Heading } from '@navikt/ds-react'

import { TabellVisning } from '@/components/TabellVisning'
import {
  useOffentligTpQuery,
  usePensjonsavtalerQuery,
} from '@/state/api/apiSlice'
import {
  generateOffentligTpRequestBody,
  generatePensjonsavtalerRequestBody,
} from '@/state/api/utils'
import { useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectCurrentSimulation,
  selectEpsHarInntektOver2G,
  selectEpsHarPensjon,
  selectErApoteker,
  selectFoedselsdato,
  selectIsEndring,
  selectSamtykke,
  selectSivilstand,
  selectSkalBeregneAfpKap19,
  selectUfoeregrad,
  selectUtenlandsperioder,
} from '@/state/userInput/selectors'
import { formatInntektToNumber } from '@/utils/inntekt'

import { Graph } from './Graph'
import { MaanedsbeloepAvansertBeregning } from './MaanedsbeloepAvansertBeregning'
import { SimuleringEndringBanner } from './SimuleringEndringBanner/SimuleringEndringBanner'
import { SimuleringGrafNavigation } from './SimuleringGrafNavigation/SimuleringGrafNavigation'
import { SimuleringPensjonsavtalerAlert } from './SimuleringPensjonsavtalerAlert/SimuleringPensjonsavtalerAlert'
import { SERIES_DEFAULT } from './constants'
import {
  type SeriesConfig,
  mergeAarligUtbetalinger,
  parseStartSluttUtbetaling,
} from './data/data'

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
  const utenlandsperioder = useAppSelector(selectUtenlandsperioder)
  const { uttaksalder, aarligInntektVsaHelPensjon, gradertUttaksperiode } =
    useAppSelector(selectCurrentSimulation)
  const skalBeregneAfpKap19 = useAppSelector(selectSkalBeregneAfpKap19)
  const intl = useIntl()

  const [offentligTpRequestBody, setOffentligTpRequestBody] = useState<
    OffentligTpRequestBody | undefined
  >(undefined)

  const [pensjonsavtalerRequestBody, setPensjonsavtalerRequestBody] = useState<
    PensjonsavtalerRequestBody | undefined
  >(undefined)

  const {
    data: offentligTpData,
    isFetching: isOffentligTpLoading,
    isError: isOffentligTpError,
  } = useOffentligTpQuery(offentligTpRequestBody as OffentligTpRequestBody, {
    skip: !offentligTpRequestBody || !harSamtykket || !uttaksalder,
  })

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
                              // If full pension starts in January, end gradual income in December of previous year
                              aar: uttaksalder.aar - 1,
                              maaneder: 11,
                            }
                          : {
                              // Otherwise, end gradual income the month before full pension starts
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
                    sluttAlder: aarligInntektVsaHelPensjon.sluttAlder,
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
          afpOffentligListe && afpOffentligListe.length > 0
            ? afpOffentligListe.length === 1
              ? // Single element: show same for all ages (livsvarig)
                parseStartSluttUtbetaling({
                  startAlder: {
                    aar: afpOffentligListe[0].alder,
                    maaneder: 0,
                  },
                  aarligUtbetaling: afpOffentligListe[0].beloep,
                })
              : // Multiple elements: first at set age, second till infinity
                [
                  {
                    alder: afpOffentligListe[0].alder,
                    beloep: afpOffentligListe[0].beloep,
                  },
                  {
                    alder: Infinity,
                    beloep: afpOffentligListe[1].beloep,
                  },
                ]
            : [],
          afpPrivatListe ? afpPrivatListe : [],
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
            offentligTpData?.simulertTjenestepensjon?.simuleringsresultat
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
      offentligTpData?.simulertTjenestepensjon?.simuleringsresultat
        .utbetalingsperioder,
      alderspensjonListe,
    ]
  )

  useEffect(() => {
    if (harSamtykket && uttaksalder) {
      setOffentligTpRequestBody(
        generateOffentligTpRequestBody({
          afp,
          foedselsdato,
          sivilstand,
          epsHarPensjon,
          epsHarInntektOver2G,
          aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
          gradertUttak: gradertUttaksperiode ?? undefined,
          heltUttak: {
            uttaksalder,
            aarligInntektVsaPensjon: aarligInntektVsaHelPensjon,
          },
          utenlandsperioder,
          erApoteker,
        })
      )

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
      offentligTpData?.simulertTjenestepensjon?.simuleringsresultat
        ?.betingetTjenestepensjonErInkludert) ??
    false

  const isEnkel = visning === 'enkel'

  return (
    <section className={styles.section}>
      {!isEndring && (
        <div className={clsx({ [styles.intro]: isEnkel })}>
          <Heading
            className={clsx({ [styles.introTitle]: isEnkel })}
            level={headingLevel}
            size={headingLevel === '2' ? 'medium' : 'small'}
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
          data: offentligTpData,
        }}
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
            afpOffentligListe={afpOffentligListe}
            pre2025OffentligAfp={pre2025OffentligAfp}
            pensjonsavtaler={pensjonsavtalerData?.avtaler}
            simulertTjenestepensjon={offentligTpData?.simulertTjenestepensjon}
          />
        )}
    </section>
  )
}
