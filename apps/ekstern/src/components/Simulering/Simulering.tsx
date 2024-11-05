import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Heading, HeadingProps } from '@navikt/ds-react'
import Highcharts, {
  SeriesColumnOptions,
  SeriesOptionsType,
  XAxisOptions,
} from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { TabellVisning } from '@/components/TabellVisning'
import {
  usePensjonsavtalerQuery,
  useGetTpoMedlemskapQuery,
  useGetUtvidetSimuleringsresultatFeatureToggleQuery,
} from '@/state/api/apiSlice'
import { generatePensjonsavtalerRequestBody } from '@/state/api/utils'
import { useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectSamtykke,
  selectUfoeregrad,
  selectSivilstand,
  selectAfp,
} from '@/state/userInput/selectors'
import { formatInntektToNumber } from '@/utils/inntekt'
import { logger } from '@/utils/logging'

import { SERIES_DEFAULT } from './constants'
import { SimuleringEndringBanner } from './SimuleringEndringBanner/SimuleringEndringBanner'
import { SimuleringGrafNavigation } from './SimuleringGrafNavigation/SimuleringGrafNavigation'
import { SimuleringPensjonsavtalerAlert } from './SimuleringPensjonsavtalerAlert/SimuleringPensjonsavtalerAlert'
import { Simuleringsdetaljer } from './Simuleringsdetaljer/Simuleringsdetaljer'
import {
  getChartDefaults,
  generateXAxis,
  processInntektArray,
  processPensjonsberegningArray,
  processPensjonsavtalerArray,
} from './utils'
import { getChartOptions, onPointUnclick } from './utils-highcharts'

import styles from './Simulering.module.scss'

export function Simulering(props: {
  isLoading: boolean
  headingLevel: HeadingProps['level']
  aarligInntektFoerUttakBeloep: string
  alderspensjonListe?: PensjonsberegningMedDetaljer[]
  afpPrivatListe?: Pensjonsberegning[]
  afpOffentligListe?: Pensjonsberegning[]
  showButtonsAndTable?: boolean
  detaljer?: {
    trygdetid?: number
    opptjeningsgrunnlag?: SimulertOpptjeningGrunnlag[]
  }
}) {
  const intl = useIntl()
  const {
    isLoading,
    headingLevel,
    aarligInntektFoerUttakBeloep,
    alderspensjonListe,
    afpPrivatListe,
    afpOffentligListe,
    showButtonsAndTable,
    detaljer,
  } = props
  const harSamtykket = useAppSelector(selectSamtykke)
  const ufoeregrad = useAppSelector(selectUfoeregrad)
  const afp = useAppSelector(selectAfp)
  const sivilstand = useAppSelector(selectSivilstand)
  const { data: utvidetSimuleringsresultatFeatureToggle } =
    useGetUtvidetSimuleringsresultatFeatureToggleQuery()

  const [XAxis, setXAxis] = React.useState<string[]>([])
  const [showVisFlereAarButton, setShowVisFlereAarButton] =
    React.useState<boolean>(false)
  const [showVisFaerreAarButton, setShowVisFaerreAarButton] =
    React.useState<boolean>(false)
  const {
    uttaksalder,
    aarligInntektVsaHelPensjon,
    gradertUttaksperiode,
    utenlandsperioder,
  } = useAppSelector(selectCurrentSimulation)

  const [pensjonsavtalerRequestBody, setPensjonsavtalerRequestBody] =
    React.useState<PensjonsavtalerRequestBody | undefined>(undefined)
  const [chartOptions, setChartOptions] = React.useState<Highcharts.Options>(
    getChartOptions(
      styles,
      setShowVisFlereAarButton,
      setShowVisFaerreAarButton,
      intl
    )
  )

  const [isPensjonsavtaleFlagVisible, setIsPensjonsavtaleFlagVisible] =
    React.useState<boolean>(false)
  const chartRef = React.useRef<HighchartsReact.RefObject>(null)
  const {
    data: pensjonsavtaler,
    isFetching: isPensjonsavtalerLoading,
    isSuccess: isPensjonsavtalerSuccess,
    isError: isPensjonsavtalerError,
  } = usePensjonsavtalerQuery(
    pensjonsavtalerRequestBody as PensjonsavtalerRequestBody,
    {
      skip: !pensjonsavtalerRequestBody || !harSamtykket || !uttaksalder,
    }
  )
  const { data: tpo, isError: isTpoError } = useGetTpoMedlemskapQuery(
    undefined,
    {
      skip: !harSamtykket,
    }
  )

  React.useEffect(() => {
    if (isTpoError) {
      logger('alert', {
        tekst:
          'TPO infoboks: Vi klarte ikke å sjekke om du har pensjonsavtaler i offentlig sektor',
      })
    } else if (tpo?.tpLeverandoerListe && tpo?.tpLeverandoerListe.length > 0) {
      logger('alert', {
        tekst: 'TPO infoboks: Du kan ha rett til offentlig tjenestepensjon',
      })
    }
  }, [tpo, isTpoError])

  React.useEffect(() => {
    /* c8 ignore next 3 */
    function onPointUnclickEventHandler(e: Event) {
      onPointUnclick(e, chartRef.current?.chart)
    }
    document.addEventListener('click', onPointUnclickEventHandler)
    return () =>
      document.removeEventListener('click', onPointUnclickEventHandler)
  }, [])

  // Hent pensjonsavtaler
  React.useEffect(() => {
    if (harSamtykket && uttaksalder) {
      const requestBody = generatePensjonsavtalerRequestBody({
        aarligInntektFoerUttakBeloep,
        ufoeregrad,
        afp,
        sivilstand,
        heltUttak: {
          uttaksalder,
          aarligInntektVsaPensjon: aarligInntektVsaHelPensjon,
        },
        gradertUttak: gradertUttaksperiode ? gradertUttaksperiode : undefined,
        utenlandsperioder,
      })
      setPensjonsavtalerRequestBody(requestBody)
    }
  }, [harSamtykket, uttaksalder])

  React.useEffect(() => {
    if (chartRef.current) {
      if (isLoading || isPensjonsavtalerLoading) {
        chartRef.current.chart.showLoading(
          `<div class="${styles.loader}"><div></div><div></div><div></div><div></div></div>`
        )
      } else {
        chartRef.current.chart.hideLoading()
      }
    }
  }, [isLoading, isPensjonsavtalerLoading])

  // Calculates the length of the x-axis, once at first and every time uttakalder or pensjonsavtaler is updated
  React.useEffect(() => {
    const startAar = gradertUttaksperiode
      ? gradertUttaksperiode.uttaksalder.aar
      : uttaksalder?.aar

    // recalculates temporary without pensjonsavtaler when alderspensjon is ready but not pensjonsavtaler
    if (startAar && !isLoading && isPensjonsavtalerLoading) {
      setXAxis(generateXAxis(startAar, [], setIsPensjonsavtaleFlagVisible))
    }
    // recalculates correclty when alderspensjon AND pensjonsavtaler are done loading
    if (startAar && !isLoading && !isPensjonsavtalerLoading) {
      setXAxis(
        generateXAxis(
          startAar,
          pensjonsavtaler?.avtaler ?? [],
          setIsPensjonsavtaleFlagVisible
        )
      )
    }
  }, [alderspensjonListe, pensjonsavtaler])

  const pensjonsavtalerAlert = React.useMemo(():
    | { variant: 'info' | 'warning'; text: string }
    | undefined => {
    const isPartialWith0Avtaler =
      pensjonsavtaler?.partialResponse && pensjonsavtaler?.avtaler.length === 0

    if (tpo) {
      if (tpo?.tpLeverandoerListe.length > 0) {
        if (isPensjonsavtalerError || isPartialWith0Avtaler) {
          return {
            variant: 'warning',
            text: 'beregning.tpo.info.pensjonsavtaler.error',
          }
        } else if (isPensjonsavtalerSuccess) {
          if (pensjonsavtaler.partialResponse) {
            return {
              variant: 'warning',
              text: 'beregning.tpo.info.pensjonsavtaler.partial',
            }
          } else {
            return {
              variant: 'info',
              text: 'beregning.tpo.info',
            }
          }
        }
      } else {
        if (isPensjonsavtalerError || isPartialWith0Avtaler) {
          return {
            variant: 'warning',
            text: 'beregning.pensjonsavtaler.error',
          }
        } else if (pensjonsavtaler?.partialResponse) {
          return {
            variant: 'warning',
            text: 'beregning.pensjonsavtaler.partial',
          }
        }
      }
    } else {
      if (isTpoError && (isPensjonsavtalerError || isPartialWith0Avtaler)) {
        return {
          variant: 'warning',
          text: 'beregning.tpo.error.pensjonsavtaler.error',
        }
      } else if (isTpoError && isPensjonsavtalerSuccess) {
        if (pensjonsavtaler.partialResponse) {
          return {
            variant: 'warning',
            text: 'beregning.tpo.error.pensjonsavtaler.partial',
          }
        } else {
          return {
            variant: 'warning',
            text: 'beregning.tpo.error',
          }
        }
      }
    }
  }, [
    isTpoError,
    tpo,
    isPensjonsavtalerSuccess,
    isPensjonsavtalerError,
    pensjonsavtaler,
  ])

  // Redraws the graph when the x-axis has changed
  React.useEffect(() => {
    const startAar = gradertUttaksperiode
      ? gradertUttaksperiode.uttaksalder.aar
      : uttaksalder?.aar
    const startMaaned = gradertUttaksperiode
      ? gradertUttaksperiode.uttaksalder.maaneder
      : uttaksalder?.maaneder

    if (startAar && startMaaned !== undefined && alderspensjonListe) {
      setChartOptions({
        ...getChartDefaults(XAxis),
        series: [
          {
            ...SERIES_DEFAULT.SERIE_INNTEKT,
            name: intl.formatMessage({ id: SERIES_DEFAULT.SERIE_INNTEKT.name }),
            data: processInntektArray({
              inntektFoerUttakBeloep: formatInntektToNumber(
                aarligInntektFoerUttakBeloep
              ),
              gradertUttak:
                gradertUttaksperiode && uttaksalder
                  ? {
                      fra: gradertUttaksperiode?.uttaksalder,
                      til: uttaksalder,
                      beloep: formatInntektToNumber(
                        gradertUttaksperiode?.aarligInntektVsaPensjonBeloep
                      ),
                    }
                  : undefined,
              heltUttak: uttaksalder
                ? {
                    fra: uttaksalder,
                    til: aarligInntektVsaHelPensjon?.sluttAlder,
                    beloep: formatInntektToNumber(
                      aarligInntektVsaHelPensjon?.beloep
                    ),
                  }
                : undefined,
              length: XAxis.length,
            }),
          } as SeriesOptionsType,
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
                    XAxis.length
                  ),
                } as SeriesOptionsType,
              ]
            : []),
          ...(isPensjonsavtalerSuccess && pensjonsavtaler?.avtaler.length > 0
            ? [
                {
                  ...SERIES_DEFAULT.SERIE_TP,
                  name: intl.formatMessage({
                    id: SERIES_DEFAULT.SERIE_TP.name,
                  }),
                  /* c8 ignore next 1 */
                  data: processPensjonsavtalerArray(
                    startAar - 1,
                    XAxis.length,
                    pensjonsavtaler?.avtaler
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
              XAxis.length
            ),
          } as SeriesOptionsType,
        ],
      })
    }
  }, [XAxis])

  return (
    <section className={styles.section}>
      <Heading level={headingLevel} size="medium" className={styles.title}>
        <FormattedMessage id="beregning.highcharts.title" />
      </Heading>

      <SimuleringEndringBanner
        heltUttaksalder={uttaksalder}
        gradertUttaksperiode={gradertUttaksperiode ?? undefined}
      />

      <div data-testid="highcharts-aria-wrapper" aria-hidden={true}>
        <HighchartsReact
          ref={chartRef}
          highcharts={Highcharts}
          options={chartOptions}
        />
      </div>
      {showButtonsAndTable && (
        <SimuleringGrafNavigation
          showVisFaerreAarButton={showVisFaerreAarButton}
          showVisFlereAarButton={showVisFlereAarButton}
        />
      )}
      <SimuleringPensjonsavtalerAlert
        variant={pensjonsavtalerAlert?.variant}
        text={pensjonsavtalerAlert?.text}
        showInfo={!isPensjonsavtalerLoading && isPensjonsavtaleFlagVisible}
      />
      {showButtonsAndTable && (
        <TabellVisning
          series={chartOptions.series as SeriesColumnOptions[]}
          aarArray={(chartOptions?.xAxis as XAxisOptions).categories}
        />
      )}
      {/* c8 ignore next 6 - detaljer skal kun vises i dev for test formål */}
      {utvidetSimuleringsresultatFeatureToggle?.enabled && detaljer && (
        <Simuleringsdetaljer
          alderspensjonListe={alderspensjonListe}
          detaljer={detaljer}
        />
      )}
    </section>
  )
}
