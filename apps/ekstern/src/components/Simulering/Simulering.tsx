import { useEffect, useRef, useState } from 'react'

import { InformationSquareFillIcon } from '@navikt/aksel-icons'
import { ChevronLeftCircle, ChevronRightCircle } from '@navikt/ds-icons'
import { Button } from '@navikt/ds-react'
import Highcharts, {
  SeriesColumnOptions,
  SeriesOptionsType,
  XAxisOptions,
} from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { TabellVisning } from '@/components/TabellVisning'
import {
  useGetPersonQuery,
  usePensjonsavtalerQuery,
} from '@/state/api/apiSlice'
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

import { PENSJONSGIVENDE_DATA, SERIES_DEFAULT } from './constants'
import {
  getChartDefaults,
  generateXAxis,
  onVisFaerreAarClick,
  onVisFlereAarClick,
  processPensjonsberegningArray,
  processPensjonsavtalerArray,
} from './utils'
import { getChartOptions, onPointUnclick } from './utils-highcharts'

import styles from './Simulering.module.scss'

export function Simulering(props: {
  alderspensjon?: AlderspensjonResponseBody
  showAfp: boolean
  showButtonsAndTable?: boolean
}) {
  const { alderspensjon, showAfp, showButtonsAndTable } = props
  const harSamtykket = useAppSelector(selectSamtykke)
  useState<boolean>(false)
  const [showVisFlereAarButton, setShowVisFlereAarButton] =
    useState<boolean>(false)
  const [showVisFaerreAarButton, setShowVisFaerreAarButton] =
    useState<boolean>(false)
  const { startAlder, startMaaned } = useAppSelector(selectCurrentSimulation)
  const [pensjonsavtalerRequestBody, setPensjonsavtalerRequestBody] = useState<
    PensjonsavtalerRequestBody | undefined
  >(undefined)
  const [chartOptions, setChartOptions] = useState<Highcharts.Options>(
    getChartOptions(styles, setShowVisFlereAarButton, setShowVisFaerreAarButton)
  )
  const [isPensjonsavtaleFlagVisible, setIsPensjonsavtaleFlagVisible] =
    useState<boolean>(false)
  const chartRef = useRef<HighchartsReact.RefObject>(null)
  const { data: person } = useGetPersonQuery()
  const { data: pensjonsavtaler, isSuccess: isPensjonsavtalerSuccess } =
    usePensjonsavtalerQuery(
      pensjonsavtalerRequestBody as PensjonsavtalerRequestBody,
      {
        skip: !pensjonsavtalerRequestBody || !harSamtykket || !startAlder,
      }
    )

  useEffect(() => {
    /* c8 ignore next 3 */
    function onPointUnclickEventHandler(e: Event) {
      onPointUnclick(e, chartRef.current?.chart)
    }
    document.addEventListener('click', onPointUnclickEventHandler)
    return () =>
      document.removeEventListener('click', onPointUnclickEventHandler)
  }, [])

  // Hent pensjonsavtaler
  useEffect(() => {
    if (harSamtykket && startAlder) {
      const requestBody = generatePensjonsavtalerRequestBody({
        aar: startAlder,
        maaned: startMaaned ?? 1,
      })
      setPensjonsavtalerRequestBody(requestBody)
    }
  }, [harSamtykket, startAlder, startMaaned])

  useEffect(() => {
    if (startAlder && alderspensjon && person?.foedselsdato) {
      const aarArray = generateXAxis(
        startAlder,
        pensjonsavtaler ?? [],
        setIsPensjonsavtaleFlagVisible
      )
      setChartOptions({
        ...getChartDefaults(aarArray),
        series: [
          {
            ...SERIES_DEFAULT.SERIE_INNTEKT,
            data: [...PENSJONSGIVENDE_DATA].splice(0, aarArray.length),
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
          ...(isPensjonsavtalerSuccess
            ? [
                {
                  ...SERIES_DEFAULT.SERIE_TP,
                  /* c8 ignore next 1 */
                  data: processPensjonsavtalerArray(
                    startAlder - 1,
                    aarArray.length,
                    person.foedselsdato,
                    pensjonsavtaler
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
  }, [startAlder, alderspensjon, pensjonsavtaler, person])

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
                icon={<ChevronLeftCircle aria-hidden />}
                iconPosition="left"
                size="xsmall"
                variant="tertiary"
                onClick={onVisFaerreAarClick}
              >
                Færre år
              </Button>
            )}
          </div>
          <div
            className={`${styles.buttonRowElement} ${styles.buttonRowElement__Right}`}
          >
            {/* c8 ignore next 10 - Dette dekkes av cypress scenario graffHorizontalScroll.cy */}
            {showVisFlereAarButton && (
              <Button
                icon={<ChevronRightCircle aria-hidden />}
                iconPosition="right"
                size="xsmall"
                variant="tertiary"
                onClick={onVisFlereAarClick}
              >
                Flere år
              </Button>
            )}
          </div>
        </div>
      )}
      {isPensjonsavtaleFlagVisible && (
        <div className={styles.info}>
          <InformationSquareFillIcon
            className={styles.infoIcon}
            fontSize="1.5rem"
            aria-hidden
          />
          <p className={styles.infoText}>
            Du har pensjonsavtaler som starter før valgt alder. Se detaljer i
            grunnlaget under.
          </p>
        </div>
      )}
      {showButtonsAndTable && (
        <TabellVisning
          series={chartOptions.series as SeriesColumnOptions[]}
          aarArray={(chartOptions?.xAxis as XAxisOptions).categories}
          showAfp={showAfp}
          showPensjonsavtaler={
            isPensjonsavtalerSuccess && pensjonsavtaler.length > 0
          }
        />
      )}
    </section>
  )
}
