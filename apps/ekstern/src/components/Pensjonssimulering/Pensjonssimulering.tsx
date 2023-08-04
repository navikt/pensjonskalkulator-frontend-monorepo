import { useEffect, useState } from 'react'

import { ChevronLeftCircle, ChevronRightCircle } from '@navikt/ds-icons'
import { Button, ReadMore } from '@navikt/ds-react'
import Highcharts, { SeriesColumnOptions, XAxisOptions } from 'highcharts'
import HighchartsAccessibility from 'highcharts/modules/accessibility'
import HighchartsReact from 'highcharts-react-official'

import { TabellVisning } from '@/components/TabellVisning'

import {
  SERIE_NAME_INNTEKT,
  SERIE_NAME_AFP,
  SERIE_NAME_TP,
  SERIE_NAME_ALDERSPENSJON,
  SERIE_COLOR_INNTEKT,
  SERIE_COLOR_AFP,
  SERIE_COLOR_TP,
  SERIE_COLOR_ALDERSPENSJON,
  COLUMN_WIDTH,
  MAX_UTTAKSALDER,
  AFP_DATA,
  FOLKETRYGDEN_DATA,
  getChartOptions,
  generateXAxis,
  onVisFaerreAarClick,
  onVisFlereAarClick,
  PENSJONSGIVENDE_DATA,
  simulateDataArray,
  simulateTjenestepensjon,
  removeHandleChartScrollEventListener,
} from './utils'

import styles from './Pensjonssimulering.module.scss'

type PensjonssimuleringProps = {
  uttaksalder: number
}

HighchartsAccessibility(Highcharts)

export function Pensjonssimulering({ uttaksalder }: PensjonssimuleringProps) {
  const [showVisFlereAarButton, setShowVisFlereAarButton] =
    useState<boolean>(false)
  const [showVisFaerreAarButton, setShowVisFaerreAarButton] =
    useState<boolean>(false)

  const [chartOptions, setChartOptions] = useState<Highcharts.Options>(
    getChartOptions(styles, setShowVisFlereAarButton, setShowVisFaerreAarButton)
  )
  const [isVisTabellOpen, setVisTabellOpen] = useState<boolean>(false)

  useEffect(() => {
    return removeHandleChartScrollEventListener
  }, [])

  useEffect(() => {
    const aarArray = generateXAxis(uttaksalder, MAX_UTTAKSALDER)
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
          data: simulateTjenestepensjon(uttaksalder, MAX_UTTAKSALDER),
        },
        {
          type: 'column',
          pointWidth: COLUMN_WIDTH,
          name: SERIE_NAME_ALDERSPENSJON,
          color: SERIE_COLOR_ALDERSPENSJON,
          data: simulateDataArray(
            FOLKETRYGDEN_DATA,
            aarArray.length,
            uttaksalder,
            18_000
          ),
        },
      ],
    })
  }, [uttaksalder])

  return (
    <section className={styles.section}>
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
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
        header={isVisTabellOpen ? 'Lukk tabell' : 'Vis tabell'}
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
