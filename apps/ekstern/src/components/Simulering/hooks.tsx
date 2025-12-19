import Highcharts, { SeriesOptionsType } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import React, { useMemo } from 'react'
import { useIntl } from 'react-intl'

import {
  useAlderspensjonQuery,
  useGetAfpOffentligLivsvarigQuery,
  useGetPersonQuery,
  useOffentligTpFoer1963Query,
  useOffentligTpQuery,
} from '@/state/api/apiSlice'
import { isOffentligTpFoer1963 } from '@/state/api/typeguards'
import {
  generateAlderspensjonRequestBody,
  generateOffentligTpFoer1963RequestBody,
  generateOffentligTpRequestBody,
} from '@/state/api/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttakBeloep,
  selectAfp,
  selectAfpInntektMaanedFoerUttak,
  selectCurrentSimulation,
  selectEpsHarInntektOver2G,
  selectEpsHarPensjon,
  selectErApoteker,
  selectFoedselsdato,
  selectLoependeVedtak,
  selectSamtykke,
  selectSamtykkeOffentligAFP,
  selectSivilstand,
  selectSkalBeregneAfpKap19,
  selectSkalBeregneKunAlderspensjon,
  selectStillingsprosentVsaGradertPensjon,
  selectStillingsprosentVsaPensjon,
  selectUtenlandsperioder,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import {
  getAlderMinus1Maaned,
  isAlderLikEllerOverAnnenAlder,
  isAlderOver62,
  isFoedtFoer1963,
  transformFoedselsdatoToAlder,
} from '@/utils/alder'
import { formatInntektToNumber } from '@/utils/inntekt'

import { finnAllePensjonsavtalerVedUttak } from './MaanedsbeloepAvansertBeregning/utils'
import { SERIES_DEFAULT } from './constants'
import {
  generateXAxis,
  getChartDefaults,
  processAfpPensjonsberegningArray,
  processInntektArray,
  processPensjonsavtalerArray,
  processPensjonsberegningArray,
  processPensjonsberegningArrayForKap19,
  processPre2025OffentligAfpPensjonsberegningArray,
  processPre2025OffentligAfpWithSpkPerioder,
} from './utils'
import { getChartOptions, onPointUnclick } from './utils-highcharts'

import globalClassNames from './Simulering.module.scss'

export const useSimuleringChartLocalState = (initialValues: {
  styles: Partial<typeof globalClassNames>
  chartRef: React.RefObject<HighchartsReact.RefObject | null>
  foedselsdato?: string
  isEndring: boolean
  uttaksalder: Alder | null
  gradertUttaksperiode: GradertUttak | null
  aarligInntektFoerUttakBeloep: string
  aarligInntektVsaHelPensjon?: AarligInntektVsaPensjon
  isLoading: boolean
  alderspensjonListe?: AlderspensjonPensjonsberegning[]
  pre2025OffentligAfp?: AfpEtterfulgtAvAlderspensjon
  afpPrivatListe?: AfpPensjonsberegning[]
  afpOffentligListe?: AfpPensjonsberegning[]
  afpPerioderFom65aar?: UtbetalingsperiodeFoer1963[]
  loependeLivsvarigAfpOffentlig?: AfpOffentligLivsvarig
  pensjonsavtaler: {
    isLoading: boolean
    data?: {
      avtaler: Pensjonsavtale[]
      partialResponse: boolean
    }
  }
  offentligTp: {
    isLoading: boolean
    data?: OffentligTp | OffentligTpFoer1963
  }
}) => {
  const dispatch = useAppDispatch()
  const xAxis = useAppSelector((state) => state.userInput.xAxis)
  const {
    styles,
    chartRef,
    foedselsdato,
    isEndring,
    uttaksalder,
    gradertUttaksperiode,
    aarligInntektFoerUttakBeloep,
    aarligInntektVsaHelPensjon,
    isLoading,
    alderspensjonListe,
    pre2025OffentligAfp,
    afpPrivatListe,
    afpOffentligListe,
    afpPerioderFom65aar,
    loependeLivsvarigAfpOffentlig,
    pensjonsavtaler,
    offentligTp,
  } = initialValues

  const { isLoading: isPensjonsavtalerLoading, data: pensjonsavtalerData } =
    pensjonsavtaler
  const { isLoading: isOffentligTpLoading, data: offentligTpData } = offentligTp
  const offentligTpUtbetalingsperioder =
    offentligTpData?.simulertTjenestepensjon?.simuleringsresultat
      .utbetalingsperioder
  const intl = useIntl()

  const [showVisFlereAarButton, setShowVisFlereAarButton] =
    React.useState<boolean>(false)
  const [showVisFaerreAarButton, setShowVisFaerreAarButton] =
    React.useState<boolean>(false)
  const [isPensjonsavtaleFlagVisible, setIsPensjonsavtaleFlagVisible] =
    React.useState<boolean>(false)

  const pre2025OffentligAfpListe: AfpPensjonsberegning[] = pre2025OffentligAfp
    ? Array.from(
        Array(67 - pre2025OffentligAfp.alderAar).keys(),
        (_, index) => ({
          alder: pre2025OffentligAfp.alderAar + index,
          beloep:
            index === 0
              ? pre2025OffentligAfp.totaltAfpBeloep *
                (12 - (uttaksalder?.maaneder ?? 0))
              : pre2025OffentligAfp.totaltAfpBeloep * 12,
        })
      )
    : []

  const [chartOptions, setChartOptions] = React.useState<Highcharts.Options>(
    getChartOptions(
      styles,
      setShowVisFlereAarButton,
      setShowVisFaerreAarButton,
      intl
    )
  )

  React.useEffect(() => {
    /* c8 ignore next 3 */
    function onPointUnclickEventHandler(e: Event) {
      onPointUnclick(e, chartRef.current?.chart)
    }
    document.addEventListener('click', onPointUnclickEventHandler)
    return () =>
      document.removeEventListener('click', onPointUnclickEventHandler)
  }, [])

  React.useEffect(() => {
    if (chartRef.current) {
      if (isLoading || isPensjonsavtalerLoading || isOffentligTpLoading) {
        chartRef.current.chart.showLoading(
          `<div class="${styles.loader}"><div></div><div></div><div></div><div></div></div>`
        )
      } else {
        chartRef.current.chart.hideLoading()
      }
    }
  }, [isLoading, isPensjonsavtalerLoading, isOffentligTpLoading])

  // Update the useEffect that calculates x-axis length
  React.useEffect(() => {
    const startAar =
      isEndring && foedselsdato
        ? transformFoedselsdatoToAlder(foedselsdato).aar
        : gradertUttaksperiode
          ? gradertUttaksperiode.uttaksalder.aar
          : uttaksalder?.aar

    if (startAar) {
      // recalculates temporary without pensjonsavtaler when alderspensjon is ready but not pensjonsavtaler or offentligTp
      if (!isLoading && (isPensjonsavtalerLoading || isOffentligTpLoading)) {
        const newXAxis = generateXAxis(
          startAar,
          isEndring,
          [],
          offentligTpUtbetalingsperioder
            ? [...offentligTpUtbetalingsperioder]
            : [],
          setIsPensjonsavtaleFlagVisible
        )
        dispatch(userInputActions.setXAxis(newXAxis))
      }
      // recalculates correctly when alderspensjon AND pensjonsavtaler AND offentligTp are done loading
      if (!isLoading && !isPensjonsavtalerLoading && !isOffentligTpLoading) {
        const newXAxis = generateXAxis(
          startAar,
          isEndring,
          pensjonsavtalerData?.avtaler ?? [],
          offentligTpUtbetalingsperioder
            ? [...offentligTpUtbetalingsperioder]
            : [],
          setIsPensjonsavtaleFlagVisible
        )
        dispatch(userInputActions.setXAxis(newXAxis))
      }
    }
  }, [
    alderspensjonListe,
    pensjonsavtalerData,
    isPensjonsavtalerLoading,
    offentligTpUtbetalingsperioder,
    isOffentligTpLoading,
  ])

  // Maintain x-axis values during loading states
  React.useEffect(() => {
    if (
      (isLoading || isPensjonsavtalerLoading || isOffentligTpLoading) &&
      xAxis.length > 0
    ) {
      dispatch(userInputActions.setXAxis(xAxis))
    }
  }, [isLoading, isPensjonsavtalerLoading, isOffentligTpLoading])

  // Redraws the graph when the x-axis has changed
  React.useEffect(() => {
    const startAar =
      isEndring && foedselsdato
        ? transformFoedselsdatoToAlder(foedselsdato).aar
        : gradertUttaksperiode
          ? gradertUttaksperiode.uttaksalder.aar
          : uttaksalder?.aar
    const startMaaned = isEndring
      ? 0
      : gradertUttaksperiode
        ? gradertUttaksperiode.uttaksalder.maaneder
        : uttaksalder?.maaneder
    if (startAar && startMaaned !== undefined && alderspensjonListe) {
      // Sjekk om vi skal vise simulert offentlig AFP når løpende offentlig AFP er definert
      const shouldShowAfpOffentlig =
        !loependeLivsvarigAfpOffentlig ||
        loependeLivsvarigAfpOffentlig.afpStatus === false ||
        (loependeLivsvarigAfpOffentlig.afpStatus === true &&
          loependeLivsvarigAfpOffentlig.maanedligBeloep === 0) ||
        (loependeLivsvarigAfpOffentlig.afpStatus == null &&
          loependeLivsvarigAfpOffentlig.maanedligBeloep == null)

      setChartOptions({
        ...getChartDefaults(xAxis),
        series: [
          ...(aarligInntektFoerUttakBeloep != '0' ||
          gradertUttaksperiode?.aarligInntektVsaPensjonBeloep ||
          aarligInntektVsaHelPensjon?.beloep
            ? [
                {
                  ...SERIES_DEFAULT.SERIE_INNTEKT,
                  name: intl.formatMessage({
                    id: SERIES_DEFAULT.SERIE_INNTEKT.name,
                  }),
                  data: processInntektArray({
                    xAxisStartAar: isEndring ? startAar : startAar - 1,
                    inntektFoerUttakBeloep: formatInntektToNumber(
                      aarligInntektFoerUttakBeloep
                    ),
                    gradertUttak:
                      gradertUttaksperiode && uttaksalder
                        ? {
                            fra: gradertUttaksperiode?.uttaksalder,
                            til:
                              // Vis inntekt ved siden av pre2025 offentlig AFP frem til 67
                              pre2025OffentligAfp &&
                              gradertUttaksperiode.aarligInntektVsaPensjonBeloep
                                ? getAlderMinus1Maaned({ aar: 67, maaneder: 0 })
                                : getAlderMinus1Maaned(uttaksalder),
                            beloep: formatInntektToNumber(
                              gradertUttaksperiode?.aarligInntektVsaPensjonBeloep
                            ),
                          }
                        : undefined,
                    heltUttak: uttaksalder
                      ? {
                          fra: uttaksalder,
                          til: aarligInntektVsaHelPensjon?.sluttAlder
                            ? getAlderMinus1Maaned(
                                aarligInntektVsaHelPensjon?.sluttAlder
                              )
                            : undefined,
                          beloep: formatInntektToNumber(
                            aarligInntektVsaHelPensjon?.beloep
                          ),
                        }
                      : undefined,
                    xAxisLength: xAxis.length,
                  }),
                } as SeriesOptionsType,
              ]
            : []),

          ...(pre2025OffentligAfp
            ? [
                {
                  ...SERIES_DEFAULT.SERIE_AFP,
                  name: intl.formatMessage({
                    id: SERIES_DEFAULT.SERIE_AFP.name,
                  }),
                  /* c8 ignore next 1 */
                  data: afpPerioderFom65aar
                    ? processPre2025OffentligAfpWithSpkPerioder(
                        isEndring ? startAar : startAar - 1,
                        xAxis.length,
                        pre2025OffentligAfpListe,
                        afpPerioderFom65aar,
                        isEndring
                      )
                    : processPre2025OffentligAfpPensjonsberegningArray(
                        pre2025OffentligAfpListe.length - 1,
                        pre2025OffentligAfpListe,
                        isEndring
                      ),
                } as SeriesOptionsType,
              ]
            : []),
          ...(afpPrivatListe && afpPrivatListe.length > 0
            ? [
                {
                  ...SERIES_DEFAULT.SERIE_AFP,
                  name: intl.formatMessage({
                    id: SERIES_DEFAULT.SERIE_AFP.name,
                  }),
                  /* c8 ignore next 1 */
                  data: processAfpPensjonsberegningArray(
                    isEndring ? startAar : startAar - 1,
                    xAxis.length,
                    afpPrivatListe,
                    isEndring
                  ),
                } as SeriesOptionsType,
              ]
            : []),
          ...(shouldShowAfpOffentlig &&
          afpOffentligListe &&
          afpOffentligListe.length > 0
            ? [
                {
                  ...SERIES_DEFAULT.SERIE_AFP,
                  name: intl.formatMessage({
                    id: SERIES_DEFAULT.SERIE_AFP.name,
                  }),
                  /* c8 ignore next 1 */
                  data: processAfpPensjonsberegningArray(
                    isEndring ? startAar : startAar - 1,
                    xAxis.length,
                    afpOffentligListe,
                    isEndring
                  ),
                } as SeriesOptionsType,
              ]
            : []),
          ...((pensjonsavtalerData &&
            pensjonsavtalerData?.avtaler.length > 0) ||
          (offentligTpData?.simulertTjenestepensjon?.simuleringsresultat
            .utbetalingsperioder &&
            offentligTpData.simulertTjenestepensjon.simuleringsresultat
              .utbetalingsperioder?.length > 0)
            ? [
                {
                  ...SERIES_DEFAULT.SERIE_TP,
                  name: intl.formatMessage({
                    id: SERIES_DEFAULT.SERIE_TP.name,
                  }),
                  /* c8 ignore next 1 */
                  data: processPensjonsavtalerArray(
                    isEndring ? startAar : startAar - 1,
                    xAxis.length,
                    pensjonsavtalerData?.avtaler ?? [],
                    offentligTpData?.simulertTjenestepensjon
                      ?.simuleringsresultat.utbetalingsperioder ?? []
                  ),
                } as SeriesOptionsType,
              ]
            : []),
          {
            ...SERIES_DEFAULT.SERIE_ALDERSPENSJON,
            name: intl.formatMessage({
              id: SERIES_DEFAULT.SERIE_ALDERSPENSJON.name,
            }),
            data: pre2025OffentligAfpListe
              ? processPensjonsberegningArrayForKap19(
                  alderspensjonListe,
                  isEndring,
                  xAxis.length,
                  startAar
                )
              : processPensjonsberegningArray(
                  alderspensjonListe,
                  isEndring,
                  xAxis.length
                ),
          } as SeriesOptionsType,
        ],
      })
    }
  }, [xAxis])

  return [
    chartOptions,
    showVisFaerreAarButton,
    showVisFlereAarButton,
    isPensjonsavtaleFlagVisible,
  ] as const
}

export const useOffentligTpData = () => {
  const harSamtykket = useAppSelector(selectSamtykke)
  const harSamtykketOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const afp = useAppSelector(selectAfp)
  const sivilstand = useAppSelector(selectSivilstand)
  const foedselsdato = useAppSelector(selectFoedselsdato)
  const epsHarInntektOver2G = useAppSelector(selectEpsHarInntektOver2G)
  const epsHarPensjon = useAppSelector(selectEpsHarPensjon)
  const erApoteker = useAppSelector(selectErApoteker)
  const utenlandsperioder = useAppSelector(selectUtenlandsperioder)
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )
  const {
    uttaksalder,
    aarligInntektVsaHelPensjon,
    gradertUttaksperiode,
    beregningsvalg,
  } = useAppSelector(selectCurrentSimulation)
  const skalBeregneAfpKap19 = useAppSelector(selectSkalBeregneAfpKap19)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
  const afpInntektMaanedFoerUttak = useAppSelector(
    selectAfpInntektMaanedFoerUttak
  )
  const stillingsprosentVsaGradertUttak = useAppSelector(
    selectStillingsprosentVsaGradertPensjon
  )
  const stillingsprosentVsaHelUttak = useAppSelector(
    selectStillingsprosentVsaPensjon
  )
  const skalBeregneKunAlderspensjon = useAppSelector(
    selectSkalBeregneKunAlderspensjon
  )
  const erFoedtFoer1963 = isFoedtFoer1963(foedselsdato || '')
  const { data: person } = useGetPersonQuery()

  const {
    isSuccess: isAfpOffentligLivsvarigSuccess,
    data: loependeLivsvarigAfpOffentlig,
  } = useGetAfpOffentligLivsvarigQuery(undefined, {
    skip:
      !harSamtykketOffentligAFP ||
      !foedselsdato ||
      !isAlderOver62(foedselsdato),
  })

  const erOffentligTpFoer1963 = (erFoedtFoer1963 && harSamtykket) || false
  const alderspensjonRequestBody: AlderspensjonRequestBody | undefined =
    useMemo(() => {
      if (uttaksalder) {
        return generateAlderspensjonRequestBody({
          loependeVedtak,
          afp: afp === 'ja_offentlig' && !harSamtykketOffentligAFP ? null : afp,
          skalBeregneAfpKap19: skalBeregneAfpKap19,
          sivilstand: sivilstand,
          epsHarPensjon: epsHarPensjon,
          epsHarInntektOver2G: epsHarInntektOver2G,
          foedselsdato: person?.foedselsdato,
          aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
          gradertUttak: gradertUttaksperiode,
          heltUttak: uttaksalder && {
            uttaksalder,
            aarligInntektVsaPensjon: aarligInntektVsaHelPensjon,
          },
          utenlandsperioder,
          beregningsvalg,
          afpInntektMaanedFoerUttak: afpInntektMaanedFoerUttak,
          loependeLivsvarigAfpOffentlig: isAfpOffentligLivsvarigSuccess
            ? loependeLivsvarigAfpOffentlig
            : null,
        })
      }
    }, [
      afp,
      harSamtykketOffentligAFP,
      person,
      aarligInntektFoerUttakBeloep,
      sivilstand,
      uttaksalder,
      epsHarPensjon,
      epsHarInntektOver2G,
      gradertUttaksperiode,
      aarligInntektVsaHelPensjon,
      utenlandsperioder,
      beregningsvalg,
      skalBeregneAfpKap19,
      loependeVedtak,
      afpInntektMaanedFoerUttak,
      skalBeregneKunAlderspensjon,
      erFoedtFoer1963,
    ])

  const offentligTpFoer1963RequestBody:
    | OffentligTpFoer1963RequestBody
    | undefined = useMemo(() => {
    if (harSamtykket && uttaksalder && erFoedtFoer1963) {
      return generateOffentligTpFoer1963RequestBody({
        foedselsdato,
        sivilstand,
        epsHarInntektOver2G,
        epsHarPensjon,
        aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
        gradertUttak: gradertUttaksperiode ? gradertUttaksperiode : undefined,
        heltUttak: {
          uttaksalder,
          aarligInntektVsaPensjon: aarligInntektVsaHelPensjon,
        },
        utenlandsperioder,
        stillingsprosentOffGradertUttak: stillingsprosentVsaGradertUttak,
        stillingsprosentOffHeltUttak: stillingsprosentVsaHelUttak,
        afpInntektMaanedFoerUttak: afpInntektMaanedFoerUttak,
        skalBeregneAfpKap19: skalBeregneAfpKap19 || false,
      })
    }
  }, [
    harSamtykket,
    uttaksalder,
    skalBeregneAfpKap19,
    foedselsdato,
    sivilstand,
    epsHarInntektOver2G,
    epsHarPensjon,
    aarligInntektFoerUttakBeloep,
    gradertUttaksperiode,
    aarligInntektVsaHelPensjon,
    utenlandsperioder,
    stillingsprosentVsaGradertUttak,
    stillingsprosentVsaHelUttak,
    afpInntektMaanedFoerUttak,
    skalBeregneKunAlderspensjon,
    erFoedtFoer1963,
  ])

  const offentligTpRequestBody: OffentligTpRequestBody | undefined =
    useMemo(() => {
      if (harSamtykket && uttaksalder && !erFoedtFoer1963) {
        return generateOffentligTpRequestBody({
          afp,
          foedselsdato,
          sivilstand,
          epsHarInntektOver2G,
          epsHarPensjon,
          aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
          gradertUttak: gradertUttaksperiode ? gradertUttaksperiode : undefined,
          heltUttak: {
            uttaksalder,
            aarligInntektVsaPensjon: aarligInntektVsaHelPensjon,
          },
          utenlandsperioder,
          erApoteker,
        })
      }
    }, [
      harSamtykket,
      uttaksalder,
      skalBeregneAfpKap19,
      afp,
      foedselsdato,
      sivilstand,
      epsHarInntektOver2G,
      epsHarPensjon,
      aarligInntektFoerUttakBeloep,
      gradertUttaksperiode,
      aarligInntektVsaHelPensjon,
      utenlandsperioder,
      erApoteker,
      skalBeregneKunAlderspensjon,
      erFoedtFoer1963,
    ])

  const alderspensjonQuery = useAlderspensjonQuery(
    alderspensjonRequestBody as AlderspensjonRequestBody,
    { skip: !alderspensjonRequestBody }
  )

  const offentligTpFoer1963Query = useOffentligTpFoer1963Query(
    offentligTpFoer1963RequestBody as OffentligTpFoer1963RequestBody,
    {
      skip:
        !erFoedtFoer1963 ||
        !offentligTpFoer1963RequestBody ||
        !harSamtykket ||
        !uttaksalder,
    }
  )

  const offentligTpQuery = useOffentligTpQuery(
    offentligTpRequestBody as OffentligTpRequestBody,
    {
      skip:
        erFoedtFoer1963 ||
        !offentligTpRequestBody ||
        !harSamtykket ||
        !uttaksalder,
    }
  )

  const data = erFoedtFoer1963
    ? offentligTpFoer1963Query.data
    : offentligTpQuery.data

  const isLoading = erFoedtFoer1963
    ? offentligTpFoer1963Query.isLoading
    : offentligTpQuery.isLoading

  const isFetching = erFoedtFoer1963
    ? offentligTpFoer1963Query.isFetching
    : offentligTpQuery.isFetching

  const isError = erFoedtFoer1963
    ? offentligTpFoer1963Query.isError
    : offentligTpQuery.isError

  const dataUtenAfp = useMemo(() => {
    if (!data?.simulertTjenestepensjon || !isOffentligTpFoer1963(data)) {
      return data
    }

    const utbetalingsperioderUtenAfp =
      data.simulertTjenestepensjon.simuleringsresultat.utbetalingsperioder.filter(
        (periode) => periode.ytelsekode !== 'AFP'
      )

    return {
      ...data,
      simulertTjenestepensjon: {
        ...data.simulertTjenestepensjon,
        simuleringsresultat: {
          ...data.simulertTjenestepensjon.simuleringsresultat,
          utbetalingsperioder: utbetalingsperioderUtenAfp,
        },
      },
    }
  }, [data, erFoedtFoer1963, harSamtykket])

  let erSpkBesteberegning: boolean | undefined = false
  let tpAfpPeriode = undefined
  let afpPerioderFom65aar: UtbetalingsperiodeFoer1963[] | undefined = undefined
  let offentligTpFoer1963Data = undefined

  if (!isError && !isFetching && isOffentligTpFoer1963(data)) {
    offentligTpFoer1963Data = data

    const navAfp = alderspensjonQuery.data?.pre2025OffentligAfp?.totaltAfpBeloep
    const afpPerioder =
      data?.simulertTjenestepensjon?.simuleringsresultat.utbetalingsperioder.filter(
        (p) => p.ytelsekode === 'AFP'
      ) || []

    const minsteAlderForAfp: Alder = { aar: 65, maaneder: 0 }

    const kanTaUtAfpVedUttak = isAlderLikEllerOverAnnenAlder(
      uttaksalder!,
      minsteAlderForAfp
    )

    const uttaksAlderEller65 = kanTaUtAfpVedUttak
      ? uttaksalder!
      : minsteAlderForAfp

    tpAfpPeriode = finnAllePensjonsavtalerVedUttak(
      afpPerioder,
      uttaksAlderEller65
    ).find((periode) => periode.startAlder.aar >= 65)

    afpPerioderFom65aar = afpPerioder.filter((periode) =>
      isAlderLikEllerOverAnnenAlder(periode.startAlder, minsteAlderForAfp)
    )

    erSpkBesteberegning = erOffentligTpFoer1963
      ? navAfp !== undefined &&
        tpAfpPeriode !== undefined &&
        tpAfpPeriode.aarligUtbetaling / 12 > navAfp
      : undefined
  }
  return {
    data: dataUtenAfp,
    isLoading,
    isFetching,
    isError,
    erOffentligTpFoer1963,
    erSpkBesteberegning,
    tpAfpPeriode,
    afpPerioder:
      erSpkBesteberegning && !offentligTpFoer1963Data?.feilkode
        ? afpPerioderFom65aar
        : undefined,
  }
}
