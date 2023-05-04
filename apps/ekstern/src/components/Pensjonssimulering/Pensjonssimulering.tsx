import { useEffect, useState } from 'react'

import { ChevronRightCircle } from '@navikt/ds-icons'
import { Button } from '@navikt/ds-react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

/* eslint-disable @typescript-eslint/ban-ts-comment, import/order */
/* @ts-ignore */
import HC_rounded from '../../utils/highcharts-rounded-corners'

import {
  COLUMN_WIDTH,
  MAX_UTTAKSALDER,
  AFP_DATA,
  FOLKETRYGDEN_DATA,
  getChartOptions,
  generateXAxis,
  onVisFlereAarClick,
  PENSJONSGIVENDE_DATA,
  simulateDataArray,
  simulateTjenestepensjon,
} from './utils'
import styles from './Pensjonssimulering.module.scss'

HC_rounded(Highcharts)

type PensjonssimuleringProps = {
  uttaksalder: number
}

export function Pensjonssimulering({ uttaksalder }: PensjonssimuleringProps) {
  const [chartOptions, setChartOptions] = useState<Highcharts.Options>(
    getChartOptions(styles)
  )

  useEffect(() => {
    const aarArray = generateXAxis(uttaksalder, MAX_UTTAKSALDER)

    setChartOptions({
      chart: {
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
          name: 'Pensjonsgivende inntekt',
          color: '#868F9C',
          // TODO sørge for at border-radius alltid settes på den øverste kolonnen
          borderRadiusTopLeft: '15%',
          borderRadiusTopRight: '15%',
          data: simulateDataArray(PENSJONSGIVENDE_DATA, aarArray.length),
        } as unknown as Highcharts.SeriesOptionsType,
        {
          type: 'column',
          pointWidth: COLUMN_WIDTH,
          name: 'Avtalefestet pensjon (AFP)',
          color: 'var(--a-purple-400)',
          states: {
            hover: {
              color: 'var(--a-purple-200)',
            },
          },
          data: simulateDataArray(AFP_DATA, aarArray.length),
        },
        {
          type: 'column',
          pointWidth: COLUMN_WIDTH,
          name: 'Tjenestepensjon',
          color: 'var(--a-green-400)',
          states: {
            hover: {
              color: 'var(--a-green-200)',
            },
          },
          data: simulateTjenestepensjon(uttaksalder, MAX_UTTAKSALDER),
        },
        {
          type: 'column',
          pointWidth: COLUMN_WIDTH,
          name: 'Folketrygden (NAV)',
          color: 'var(--a-deepblue-500)',
          states: {
            hover: {
              color: 'var(--a-deepblue-200)',
            },
          },
          data: simulateDataArray(FOLKETRYGDEN_DATA, aarArray.length),
        },
      ],
    })
  }, [uttaksalder])

  return (
    <>
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      <Button
        className={styles.visFlereAar}
        icon={<ChevronRightCircle aria-hidden />}
        iconPosition="right"
        size={'xsmall'}
        variant="tertiary"
        onClick={onVisFlereAarClick}
      >
        Vis flere år
      </Button>
    </>
  )
}
