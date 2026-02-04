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
  selectIsEndring,
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
import { ALERT_VIST } from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'

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

export type PensjonsavtalerResponse = {
  isLoading: boolean
  data?: {
    avtaler: Pensjonsavtale[]
    partialResponse: boolean
  }
}

export interface PensjonsAvtalerAlertProps {
  pensjonsavtaler: {
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    data?: {
      avtaler: Pensjonsavtale[]
      partialResponse: boolean
    }
  }
  offentligTp: {
    isError: boolean
    data?: OffentligTp | OffentligTpFoer1963
  }
  isPensjonsavtaleFlagVisible: boolean
  erOffentligTpFoer1963?: boolean
}

export type OffentligTpResponse = {
  isLoading: boolean
  data?: OffentligTp | OffentligTpFoer1963
}

interface AfpOffentligAlertProps {
  harSamtykketOffentligAFP: boolean | null
  isAfpOffentligLivsvarigSuccess: boolean
  loependeLivsvarigAfpOffentlig?: AfpOffentligLivsvarig
}

export type AlertVariant = (typeof ALERT_VARIANTS)[keyof typeof ALERT_VARIANTS]

const ALERT_VARIANTS = {
  INFO: 'info',
  WARNING: 'warning',
  INLINE_INFO: 'inline-info',
} as const

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
  pensjonsavtaler: PensjonsavtalerResponse
  offentligTp: OffentligTpResponse
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

export const usePensjonsavtalerAlerts = ({
  pensjonsavtaler,
  offentligTp,
  isPensjonsavtaleFlagVisible,
  erOffentligTpFoer1963,
}: PensjonsAvtalerAlertProps) => {
  const intl = useIntl()
  const isEndring = useAppSelector(selectIsEndring)
  const {
    isLoading: isPensjonsavtalerLoading,
    isSuccess: isPensjonsavtalerSuccess,
    isError: isPensjonsavtalerError,
    data: pensjonsavtalerData,
  } = pensjonsavtaler
  const { isError: isOffentligTpError, data: offentligTpData } = offentligTp

  const alertsList: Array<{
    variant: AlertVariant
    text: string
  }> = []

  if (
    offentligTpData &&
    erOffentligTpFoer1963 &&
    isOffentligTpFoer1963(offentligTpData) &&
    offentligTpData.feilkode === 'OPPFYLLER_IKKE_INNGANGSVILKAAR'
  ) {
    const text = 'beregning.pensjonsavtaler.alert.afp_offentlig.error'
    const variant = ALERT_VARIANTS.WARNING
    logger(ALERT_VIST, {
      tekst: `Pensjonsavtaler:`,
      variant,
    })
    alertsList.push({
      variant,
      text,
    })
  }

  // Varselet om at avtaler starter tidligere enn uttakstidspunkt skal være øverst av varslene
  if (!isPensjonsavtalerLoading && isPensjonsavtaleFlagVisible) {
    const text = 'beregning.pensjonsavtaler.alert.avtaler_foer_alder'
    const variant = ALERT_VARIANTS.INLINE_INFO
    logger(ALERT_VIST, {
      tekst: `Pensjonsavtaler: ${intl.formatMessage({ id: text })}`,
      variant,
    })
    alertsList.push({
      variant,
      text,
    })
  }

  const pensjonsavtaleAlert = React.useMemo(():
    | { variant: AlertVariant; text: string }
    | undefined => {
    const isPartialWith0Avtaler =
      pensjonsavtalerData?.partialResponse &&
      pensjonsavtalerData?.avtaler.length === 0

    const isOffentligTpUkomplett =
      offentligTpData?.simuleringsresultatStatus ===
        'TOM_SIMULERING_FRA_TP_ORDNING' ||
      offentligTpData?.simuleringsresultatStatus === 'TEKNISK_FEIL'

    const isOffentligTpOK =
      offentligTpData &&
      (offentligTpData.simuleringsresultatStatus === 'OK' ||
        offentligTpData.simuleringsresultatStatus ===
          'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING')

    if (isEndring) {
      const text = 'beregning.pensjonsavtaler.alert.endring'
      const variant = ALERT_VARIANTS.INLINE_INFO
      return {
        variant,
        text,
      }
    }

    // Offentlig-TP OK + Private pensjonsavtaler FEIL/UKOMPLETT
    if (isOffentligTpOK && (isPensjonsavtalerError || isPartialWith0Avtaler)) {
      const text = 'beregning.pensjonsavtaler.alert.privat.error'
      const variant = ALERT_VARIANTS.WARNING
      logger(ALERT_VIST, {
        tekst: `Pensjonsavtaler: ${intl.formatMessage({ id: text })}`,
        variant,
      })
      return {
        variant,
        text,
      }
    }

    // Offentlig-TP FEIL/UKOMPLETT eller at TP_ORDNING støttes ikke + Private pensjonsavtaler FEIL/UKOMPLETT
    if (
      (isOffentligTpError ||
        isOffentligTpUkomplett ||
        offentligTpData?.simuleringsresultatStatus ===
          'TP_ORDNING_STOETTES_IKKE') &&
      (isPensjonsavtalerError || isPartialWith0Avtaler)
    ) {
      const text = 'beregning.pensjonsavtaler.alert.privat_og_offentlig.error'
      const variant = ALERT_VARIANTS.WARNING
      logger(ALERT_VIST, {
        tekst: `Pensjonsavtaler: ${intl.formatMessage({ id: text })}`,
        variant,
      })
      return {
        variant,
        text,
      }
    }

    // Offentlig-TP FEIL/UKOMPLETT + Private pensjonsavtaler OK
    if (
      (isOffentligTpError || isOffentligTpUkomplett) &&
      isPensjonsavtalerSuccess
    ) {
      const text = 'beregning.pensjonsavtaler.alert.offentlig.error'
      const variant = ALERT_VARIANTS.WARNING
      logger(ALERT_VIST, {
        tekst: `Pensjonsavtaler: ${intl.formatMessage({ id: text })}`,
        variant,
      })
      return {
        variant,
        text,
      }
    }

    // Offentlig-TP OK + Ordning støttes ikke
    if (
      offentligTpData &&
      offentligTpData.simuleringsresultatStatus === 'TP_ORDNING_STOETTES_IKKE'
    ) {
      const text = 'beregning.pensjonsavtaler.alert.stoettes_ikke'
      const variant = ALERT_VARIANTS.INFO
      logger(ALERT_VIST, {
        tekst: `Pensjonsavtaler: ${intl.formatMessage({ id: text })}`,
        variant,
      })
      return {
        variant,
        text,
      }
    }
  }, [
    isPensjonsavtaleFlagVisible,
    isPensjonsavtalerSuccess,
    isPensjonsavtalerError,
    pensjonsavtalerData,
    isOffentligTpError,
    offentligTpData,
  ])

  if (pensjonsavtaleAlert) {
    alertsList.push(pensjonsavtaleAlert)
  }

  return alertsList
}

export const useAfpOffentligAlerts = ({
  harSamtykketOffentligAFP,
  isAfpOffentligLivsvarigSuccess,
  loependeLivsvarigAfpOffentlig,
}: AfpOffentligAlertProps) => {
  const intl = useIntl()
  const foedselsdato = useAppSelector(selectFoedselsdato)

  // Viser ikke alert hvis kallet aldri ble forsøkt (query ble skippet)
  if (
    !harSamtykketOffentligAFP ||
    !foedselsdato ||
    !isAlderOver62(foedselsdato)
  ) {
    return null
  }

  // Viser ikke alert hvis bruker ikke har vedtak om afp offentlig
  if (
    isAfpOffentligLivsvarigSuccess &&
    loependeLivsvarigAfpOffentlig?.afpStatus === false
  ) {
    return null
  }

  // Viser ikke alert hvis bruker ikke har løpende livsvarig afp offentlig
  // Håndterer også tilfelle hvor backend returnerer tom respons (undefined/null verdier)
  if (
    isAfpOffentligLivsvarigSuccess &&
    !loependeLivsvarigAfpOffentlig?.afpStatus &&
    !loependeLivsvarigAfpOffentlig?.maanedligBeloep
  ) {
    return null
  }

  // Vellykket kall
  if (
    loependeLivsvarigAfpOffentlig?.afpStatus &&
    loependeLivsvarigAfpOffentlig?.maanedligBeloep &&
    loependeLivsvarigAfpOffentlig?.maanedligBeloep > 0
  ) {
    const alertText = 'beregning.alert.info.afp-offentlig-livsvarig'

    logger(ALERT_VIST, {
      tekst: `AFP Offentlig: ${intl.formatMessage({ id: alertText })}`,
      variant: 'info',
    })

    return {
      variant: 'info' as AlertVariant,
      text: alertText,
    }
  }

  // Kall feilet
  if (
    !isAfpOffentligLivsvarigSuccess ||
    (loependeLivsvarigAfpOffentlig?.afpStatus &&
      loependeLivsvarigAfpOffentlig?.maanedligBeloep === 0)
  ) {
    const alertText = 'beregning.alert.feil.afp-offentlig-livsvarig'

    logger(ALERT_VIST, {
      tekst: `AFP Offentlig: ${intl.formatMessage({ id: alertText })}`,
      variant: 'warning',
    })

    return {
      variant: 'warning' as AlertVariant,
      text: alertText,
    }
  }

  // Kall var vellykket, men beløp er ikke definert
  if (
    isAfpOffentligLivsvarigSuccess &&
    !loependeLivsvarigAfpOffentlig?.maanedligBeloep
  ) {
    const alertText = 'beregning.alert.success.afp-offentlig-livsvarig'

    logger(ALERT_VIST, {
      tekst: `AFP Offentlig: ${intl.formatMessage({ id: alertText })}`,
      variant: 'warning',
    })
    return {
      variant: 'warning' as AlertVariant,
      text: alertText,
      dataTestId: 'alert-afp-offentlig-livsvarig-success',
    }
  }
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
  }, [data])

  return useMemo(() => {
    let erSpkBesteberegning: boolean | undefined = false
    let tpAfpPeriode = undefined
    let afpPerioderFom65aar: UtbetalingsperiodeFoer1963[] | undefined =
      undefined
    let offentligTpFoer1963Data = undefined

    if (!isError && !isFetching && isOffentligTpFoer1963(data)) {
      offentligTpFoer1963Data = data

      const navAfp =
        alderspensjonQuery.data?.pre2025OffentligAfp?.totaltAfpBeloep
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
      isFetching: isFetching,
      isError,
      erOffentligTpFoer1963,
      erSpkBesteberegning,
      tpAfpPeriode,
      afpPerioder:
        erSpkBesteberegning && !offentligTpFoer1963Data?.feilkode
          ? afpPerioderFom65aar
          : undefined,
    }
  }, [
    data,
    dataUtenAfp,
    isFetching,
    isError,
    erOffentligTpFoer1963,
    uttaksalder,
    alderspensjonQuery.data?.pre2025OffentligAfp?.totaltAfpBeloep,
  ])
}
