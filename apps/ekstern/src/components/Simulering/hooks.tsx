import React from 'react'
import { useIntl } from 'react-intl'

import Highcharts, { SeriesOptionsType } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { transformFoedselsdatoToAlder } from '@/utils/alder'
import { getAlderMinus1Maaned } from '@/utils/alder'
import { formatInntektToNumber } from '@/utils/inntekt'
import { logger } from '@/utils/logging'

import { SERIES_DEFAULT } from './constants'
import {
  getChartDefaults,
  generateXAxis,
  processInntektArray,
  processPensjonsberegningArray,
  processPensjonsavtalerArray,
} from './utils'
import { getChartOptions, onPointUnclick } from './utils-highcharts'

import globalClassNames from './Simulering.module.scss'

export const useSimuleringChartLocalState = (initialValues: {
  styles: Partial<typeof globalClassNames>
  chartRef: React.RefObject<HighchartsReact.RefObject>
  foedselsdato?: string
  isEndring: boolean
  uttaksalder: Alder | null
  gradertUttaksperiode: GradertUttak | null
  aarligInntektFoerUttakBeloep: string
  aarligInntektVsaHelPensjon?: AarligInntektVsaPensjon
  isLoading: boolean
  alderspensjonListe?: PensjonsberegningMedDetaljer[]
  afpPrivatListe?: Pensjonsberegning[]
  afpOffentligListe?: Pensjonsberegning[]
  pensjonsavtaler: {
    isLoading: boolean
    data?: {
      avtaler: Pensjonsavtale[]
      partialResponse: boolean
    }
  }
  offentligTp: {
    isLoading: boolean
    data?: OffentligTp
  }
}) => {
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
    afpPrivatListe,
    afpOffentligListe,
    pensjonsavtaler,
    offentligTp,
  } = initialValues

  const { isLoading: isPensjonsavtalerLoading, data: pensjonsavtalerData } =
    pensjonsavtaler
  const { isLoading: isOffentligTpLoading, data: offentligTpData } = offentligTp
  const intl = useIntl()
  const [XAxis, setXAxis] = React.useState<string[]>([])
  const [showVisFlereAarButton, setShowVisFlereAarButton] =
    React.useState<boolean>(false)
  const [showVisFaerreAarButton, setShowVisFaerreAarButton] =
    React.useState<boolean>(false)
  const [isPensjonsavtaleFlagVisible, setIsPensjonsavtaleFlagVisible] =
    React.useState<boolean>(false)

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

  // Calculates the length of the x-axis, once at first and every time uttakalder or pensjonsavtaler is updated
  React.useEffect(() => {
    const startAar =
      isEndring && foedselsdato
        ? transformFoedselsdatoToAlder(foedselsdato).aar
        : gradertUttaksperiode
          ? gradertUttaksperiode.uttaksalder.aar
          : uttaksalder?.aar
    const offentligTpUtbetalingsperioder =
      offentligTpData?.simulertTjenestepensjon?.simuleringsresultat
        .utbetalingsperioder

    if (startAar) {
      // recalculates temporary without pensjonsavtaler when alderspensjon is ready but not pensjonsavtaler or offentligTp
      if (!isLoading && (isPensjonsavtalerLoading || isOffentligTpLoading)) {
        setXAxis(
          generateXAxis(
            startAar,
            isEndring,
            [],
            offentligTpUtbetalingsperioder
              ? [...offentligTpUtbetalingsperioder]
              : [],

            setIsPensjonsavtaleFlagVisible
          )
        )
      }
      // recalculates correclty when alderspensjon AND pensjonsavtaler AND offentligTp are done loading
      if (!isLoading && !isPensjonsavtalerLoading && !isOffentligTpLoading) {
        setXAxis(
          generateXAxis(
            startAar,
            isEndring,
            pensjonsavtalerData?.avtaler ?? [],
            offentligTpUtbetalingsperioder
              ? [...offentligTpUtbetalingsperioder]
              : [],
            setIsPensjonsavtaleFlagVisible
          )
        )
      }
    }
  }, [alderspensjonListe, pensjonsavtalerData, offentligTpData])

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
      setChartOptions({
        ...getChartDefaults(XAxis),
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
                    startAar: isEndring ? startAar : startAar - 1,
                    inntektFoerUttakBeloep: formatInntektToNumber(
                      aarligInntektFoerUttakBeloep
                    ),
                    gradertUttak:
                      gradertUttaksperiode && uttaksalder
                        ? {
                            fra: gradertUttaksperiode?.uttaksalder,
                            til: getAlderMinus1Maaned(uttaksalder),
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
                    length: XAxis.length,
                  }),
                } as SeriesOptionsType,
              ]
            : []),
          ...(afpPrivatListe
            ? [
                {
                  ...SERIES_DEFAULT.SERIE_AFP,
                  name: intl.formatMessage({
                    id: SERIES_DEFAULT.SERIE_AFP.name,
                  }),
                  /* c8 ignore next 1 */
                  data: processPensjonsberegningArray(
                    afpPrivatListe,
                    isEndring,
                    XAxis.length
                  ),
                } as SeriesOptionsType,
              ]
            : []),
          ...(afpOffentligListe
            ? [
                {
                  ...SERIES_DEFAULT.SERIE_AFP,
                  name: intl.formatMessage({
                    id: SERIES_DEFAULT.SERIE_AFP.name,
                  }),
                  /* c8 ignore next 1 */
                  data: processPensjonsberegningArray(
                    afpOffentligListe,
                    isEndring,
                    XAxis.length
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
                    XAxis.length,
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
            data: processPensjonsberegningArray(
              alderspensjonListe,
              isEndring,
              XAxis.length
            ),
          } as SeriesOptionsType,
        ],
      })
    }
  }, [XAxis])

  return [
    chartOptions,
    showVisFaerreAarButton,
    showVisFlereAarButton,
    isPensjonsavtaleFlagVisible,
  ] as const
}

export const useSimuleringPensjonsavtalerLocalState = (initialValues: {
  isEndring: boolean
  isPensjonsavtaleFlagVisible: boolean
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
    data?: OffentligTp
  }
}) => {
  const {
    isEndring,
    isPensjonsavtaleFlagVisible,
    pensjonsavtaler,
    offentligTp,
  } = initialValues
  const {
    isSuccess: isPensjonsavtalerSuccess,
    isError: isPensjonsavtalerError,
    data: pensjonsavtalerData,
  } = pensjonsavtaler

  React.useEffect(() => {
    if (offentligTp.isError) {
      logger('alert', {
        tekst:
          'TPO infoboks: Vi klarte ikke å sjekke om du har pensjonsavtaler i offentlig sektor',
      })
    } else if (
      offentligTp?.data?.muligeTpLeverandoerListe &&
      offentligTp?.data?.muligeTpLeverandoerListe.length > 0
    ) {
      logger('alert', {
        tekst: 'TPO infoboks: Du kan ha rett til offentlig tjenestepensjon',
      })
    }
  }, [offentligTp])

  const pensjonsavtalerAlert = React.useMemo(():
    | { variant: 'alert-info' | 'alert-warning' | 'info'; text: string }
    | undefined => {
    const isPartialWith0Avtaler =
      pensjonsavtaler?.data?.partialResponse &&
      pensjonsavtaler?.data?.avtaler.length === 0

    if (!pensjonsavtaler?.isLoading && isPensjonsavtaleFlagVisible) {
      return {
        variant: 'info',
        text: 'beregning.pensjonsavtaler.info',
      }
    }
    if (isEndring) {
      return {
        variant: 'info',
        text: 'beregning.tpo.info.endring',
      }
    }
    if (offentligTp && offentligTp.data) {
      if (offentligTp.data.muligeTpLeverandoerListe.length > 0) {
        if (pensjonsavtaler?.isError || isPartialWith0Avtaler) {
          return {
            variant: 'alert-warning',
            text: 'beregning.tpo.info.pensjonsavtaler.error',
          }
        } else if (pensjonsavtaler?.isSuccess) {
          if (pensjonsavtaler.data?.partialResponse) {
            return {
              variant: 'alert-warning',
              text: 'beregning.tpo.info.pensjonsavtaler.partial',
            }
          } else {
            return {
              variant: 'alert-info',
              text: 'beregning.tpo.info',
            }
          }
        }
      } else {
        if (pensjonsavtaler?.isError || isPartialWith0Avtaler) {
          return {
            variant: 'alert-warning',
            text: 'beregning.pensjonsavtaler.error',
          }
        } else if (pensjonsavtaler?.data?.partialResponse) {
          return {
            variant: 'alert-warning',
            text: 'beregning.pensjonsavtaler.partial',
          }
        }
      }
    } else {
      if (
        offentligTp.isError &&
        (pensjonsavtaler?.isError || isPartialWith0Avtaler)
      ) {
        return {
          variant: 'alert-warning',
          text: 'beregning.tpo.error.pensjonsavtaler.error',
        }
      } else if (offentligTp.isError && pensjonsavtaler?.isSuccess) {
        if (pensjonsavtaler.data?.partialResponse) {
          return {
            variant: 'alert-warning',
            text: 'beregning.tpo.error.pensjonsavtaler.partial',
          }
        } else {
          return {
            variant: 'alert-warning',
            text: 'beregning.tpo.error',
          }
        }
      }
    }
  }, [
    offentligTp,
    isPensjonsavtaleFlagVisible,
    isPensjonsavtalerSuccess,
    isPensjonsavtalerError,
    pensjonsavtalerData,
  ])

  return [pensjonsavtalerAlert] as const
}
