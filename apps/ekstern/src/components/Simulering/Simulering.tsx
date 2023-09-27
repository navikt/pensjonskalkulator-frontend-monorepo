import React from 'react'
import { FormattedMessage } from 'react-intl'

import {
  ChevronLeftCircleIcon,
  ChevronRightCircleIcon,
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
} from '@navikt/aksel-icons'
import { BodyLong, Button, Link } from '@navikt/ds-react'
import Highcharts, {
  SeriesColumnOptions,
  SeriesOptionsType,
  XAxisOptions,
} from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { AccordionContext } from '@/components/common/AccordionItem'
import { TabellVisning } from '@/components/TabellVisning'
import { usePensjonsavtalerQuery } from '@/state/api/apiSlice'
import {
  AlderspensjonResponseBody,
  PensjonsavtalerRequestBody,
} from '@/state/api/apiSlice.types'
import { generatePensjonsavtalerRequestBody } from '@/state/api/utils'
import { useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectSamtykke,
} from '@/state/userInput/selectors'

import { SERIES_DEFAULT } from './constants'
import {
  getChartDefaults,
  generateXAxis,
  onVisFaerreAarClick,
  onVisFlereAarClick,
  processInntektArray,
  processPensjonsberegningArray,
  processPensjonsavtalerArray,
} from './utils'
import { getChartOptions, onPointUnclick } from './utils-highcharts'

import styles from './Simulering.module.scss'

export function Simulering(props: {
  isLoading: boolean
  inntekt: Inntekt
  alderspensjon?: AlderspensjonResponseBody
  showAfp: boolean
  showButtonsAndTable?: boolean
}) {
  const { isLoading, inntekt, alderspensjon, showAfp, showButtonsAndTable } =
    props
  const harSamtykket = useAppSelector(selectSamtykke)
  React.useState<boolean>(false)
  const [showVisFlereAarButton, setShowVisFlereAarButton] =
    React.useState<boolean>(false)
  const [showVisFaerreAarButton, setShowVisFaerreAarButton] =
    React.useState<boolean>(false)
  const {
    ref: grunnlagPensjonsavtalerRef,
    isOpen: isPensjonsavtalerAccordionItemOpen,
    toggleOpen: togglePensjonsavtalerAccordionItem,
  } = React.useContext(AccordionContext)
  const { startAlder, startMaaned } = useAppSelector(selectCurrentSimulation)
  const [pensjonsavtalerRequestBody, setPensjonsavtalerRequestBody] =
    React.useState<PensjonsavtalerRequestBody | undefined>(undefined)
  const [chartOptions, setChartOptions] = React.useState<Highcharts.Options>(
    getChartOptions(styles, setShowVisFlereAarButton, setShowVisFaerreAarButton)
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
      skip: !pensjonsavtalerRequestBody || !harSamtykket || !startAlder,
    }
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

  // Hent pensjonsavtaler
  React.useEffect(() => {
    if (harSamtykket && startAlder) {
      const requestBody = generatePensjonsavtalerRequestBody({
        aar: startAlder,
        maaned: startMaaned ?? 1,
      })
      setPensjonsavtalerRequestBody(requestBody)
    }
  }, [harSamtykket, startAlder, startMaaned])

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

  React.useEffect(() => {
    if (startAlder && alderspensjon) {
      const aarArray = generateXAxis(
        startAlder,
        pensjonsavtaler?.avtaler ?? [],
        setIsPensjonsavtaleFlagVisible
      )
      setChartOptions({
        ...getChartDefaults(aarArray),
        series: [
          {
            ...SERIES_DEFAULT.SERIE_INNTEKT,
            data: processInntektArray(inntekt.beloep, aarArray.length),
          } as SeriesOptionsType,
          ...(showAfp
            ? [
                {
                  ...SERIES_DEFAULT.SERIE_AFP,
                  /* c8 ignore next 1 */
                  data: processPensjonsberegningArray(alderspensjon.afpPrivat),
                } as SeriesOptionsType,
              ]
            : []),
          ...(isPensjonsavtalerSuccess && pensjonsavtaler?.avtaler.length > 0
            ? [
                {
                  ...SERIES_DEFAULT.SERIE_TP,
                  /* c8 ignore next 1 */
                  data: processPensjonsavtalerArray(
                    startAlder - 1,
                    aarArray.length,
                    pensjonsavtaler?.avtaler
                  ),
                } as SeriesOptionsType,
              ]
            : []),
          {
            ...SERIES_DEFAULT.SERIE_ALDERSPENSJON,
            data: processPensjonsberegningArray(alderspensjon.alderspensjon),
          } as SeriesOptionsType,
        ],
      })
    }
  }, [startAlder, alderspensjon, pensjonsavtaler])

  return (
    <section className={styles.section}>
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        options={chartOptions}
      />

      {showButtonsAndTable && (
        <div className={styles.buttonRow}>
          <div className={styles.buttonRowElement}>
            {/* c8 ignore next 10 - Dette dekkes av cypress scenario graffHorizontalScroll.cy */}
            {showVisFaerreAarButton && (
              <Button
                icon={<ChevronLeftCircleIcon aria-hidden />}
                iconPosition="left"
                size="xsmall"
                variant="tertiary"
                onClick={onVisFaerreAarClick}
              >
                <FormattedMessage id="beregning.button.faerre_aar" />
              </Button>
            )}
          </div>
          <div
            className={`${styles.buttonRowElement} ${styles.buttonRowElement__Right}`}
          >
            {/* c8 ignore next 10 - Dette dekkes av cypress scenario graffHorizontalScroll.cy */}
            {showVisFlereAarButton && (
              <Button
                icon={<ChevronRightCircleIcon aria-hidden />}
                iconPosition="right"
                size="xsmall"
                variant="tertiary"
                onClick={onVisFlereAarClick}
              >
                <FormattedMessage id="beregning.button.flere_aar" />
              </Button>
            )}
          </div>
        </div>
      )}
      {(isPensjonsavtalerError || pensjonsavtaler?.partialResponse) && (
        <div className={styles.error}>
          <ExclamationmarkTriangleFillIcon
            className={styles.errorIcon}
            fontSize="1.5rem"
          />
          <BodyLong className={styles.errorText}>
            <FormattedMessage
              id={
                isPensjonsavtalerError
                  ? 'beregning.pensjonsavtaler.error'
                  : 'beregning.pensjonsavtaler.error.partial'
              }
              values={{
                link: (chunks) => (
                  <Link
                    onClick={(e) => {
                      e?.preventDefault()
                      if (grunnlagPensjonsavtalerRef?.current) {
                        grunnlagPensjonsavtalerRef?.current.scrollIntoView({
                          behavior: 'smooth',
                        })
                      }
                      if (!isPensjonsavtalerAccordionItemOpen)
                        togglePensjonsavtalerAccordionItem()
                    }}
                  >
                    {chunks}
                  </Link>
                ),
              }}
            />
          </BodyLong>
        </div>
      )}
      {!isPensjonsavtalerLoading && isPensjonsavtaleFlagVisible && (
        <div className={styles.info}>
          <InformationSquareFillIcon
            className={styles.infoIcon}
            fontSize="1.5rem"
            aria-hidden
          />
          <p className={styles.infoText}>
            <FormattedMessage id="beregning.pensjonsavtaler.info" />
          </p>
        </div>
      )}
      {showButtonsAndTable && (
        <TabellVisning
          series={chartOptions.series as SeriesColumnOptions[]}
          aarArray={(chartOptions?.xAxis as XAxisOptions).categories}
          showAfp={showAfp}
          showPensjonsavtaler={
            isPensjonsavtalerSuccess && pensjonsavtaler?.avtaler.length > 0
          }
        />
      )}
    </section>
  )
}
