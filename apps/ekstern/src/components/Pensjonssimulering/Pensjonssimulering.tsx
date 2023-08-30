import { useEffect, useRef, useState } from 'react'

import { ChevronLeftCircle, ChevronRightCircle } from '@navikt/ds-icons'
import { Button, ReadMore } from '@navikt/ds-react'
import Highcharts, { SeriesColumnOptions, XAxisOptions } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { TabellVisning } from '@/components/TabellVisning'
import { useAppSelector } from '@/state/hooks'
import { selectCurrentSimulation } from '@/state/userInput/selectors'

import {
  AFP_DATA,
  COLUMN_WIDTH,
  FOLKETRYGDEN_DATA,
  MAX_UTTAKSALDER,
  PENSJONSGIVENDE_DATA,
  SERIE_NAME_INNTEKT,
  SERIE_NAME_AFP,
  SERIE_NAME_TP,
  SERIE_NAME_ALDERSPENSJON,
  SERIE_COLOR_INNTEKT,
  SERIE_COLOR_AFP,
  SERIE_COLOR_TP,
  SERIE_COLOR_ALDERSPENSJON,
  getChartOptions,
  generateXAxis,
  onPointUnclick,
  onVisFaerreAarClick,
  onVisFlereAarClick,
  simulateDataArray,
  simulateTjenestepensjon,
} from './utils'

import styles from './Pensjonssimulering.module.scss'

export function Pensjonssimulering() {
  const { startAlder } = useAppSelector(selectCurrentSimulation)

  const [showVisFlereAarButton, setShowVisFlereAarButton] =
    useState<boolean>(false)
  const [showVisFaerreAarButton, setShowVisFaerreAarButton] =
    useState<boolean>(false)

  const [chartOptions, setChartOptions] = useState<Highcharts.Options>(
    getChartOptions(styles, setShowVisFlereAarButton, setShowVisFaerreAarButton)
  )
  const [isVisTabellOpen, setVisTabellOpen] = useState<boolean>(false)
  const chartRef = useRef<HighchartsReact.RefObject>(null)

  useEffect(() => {
    function onPointUnclickEventHandler(e: Event) {
      onPointUnclick(e, chartRef.current?.chart)
    }
    document.addEventListener('click', onPointUnclickEventHandler)
    return () =>
      document.removeEventListener('click', onPointUnclickEventHandler)
  }, [])

  useEffect(() => {
    if (startAlder) {
      const aarArray = generateXAxis(startAlder, MAX_UTTAKSALDER)
      setChartOptions({
        chart: {
          type: 'column',
          scrollablePlotArea: {
            minWidth: aarArray.length * COLUMN_WIDTH * 1.6,
            scrollPositionX: 0,
          },
        },
        xAxis: {
          categories: aarArray,
        },
        series: [
          {
            type: 'column',
            pointWidth: COLUMN_WIDTH,
            name: SERIE_NAME_INNTEKT,
            color: SERIE_COLOR_INNTEKT,
            data: simulateDataArray(PENSJONSGIVENDE_DATA, aarArray.length),
          },
          {
            type: 'column',
            pointWidth: COLUMN_WIDTH,
            name: SERIE_NAME_AFP,
            color: SERIE_COLOR_AFP,
            data: simulateDataArray(AFP_DATA, aarArray.length),
          },
          {
            type: 'column',
            pointWidth: COLUMN_WIDTH,
            name: SERIE_NAME_TP,
            color: SERIE_COLOR_TP,
            data: simulateTjenestepensjon(startAlder, MAX_UTTAKSALDER),
          },
          {
            type: 'column',
            pointWidth: COLUMN_WIDTH,
            name: SERIE_NAME_ALDERSPENSJON,
            color: SERIE_COLOR_ALDERSPENSJON,
            data: simulateDataArray(
              FOLKETRYGDEN_DATA,
              aarArray.length,
              startAlder,
              18_000
            ),
          },
        ],
      })
    }
  }, [startAlder])

  return (
    <section className={styles.section}>
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        options={chartOptions}
      />
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
      <ReadMore
        header={
          isVisTabellOpen
            ? 'Lukk tabell av beregningen'
            : 'Vis tabell av beregningen'
        }
        className={styles.visTabell}
        open={isVisTabellOpen}
        onClick={() => {
          setVisTabellOpen(!isVisTabellOpen)
        }}
      >
        <TabellVisning
          series={chartOptions.series as SeriesColumnOptions[]}
          aarArray={(chartOptions?.xAxis as XAxisOptions).categories}
        />
      </ReadMore>
    </section>
  )
}
