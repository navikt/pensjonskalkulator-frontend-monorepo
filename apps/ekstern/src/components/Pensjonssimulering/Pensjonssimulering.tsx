import { createRef, useEffect, useMemo } from 'react'

import { Heading } from '@navikt/ds-react'
import { BarChart } from 'chartist'
import clsx from 'clsx'

import { generateXAxis } from '../TidligstMuligeUttak/utils'

import styles from './Pensjonssimulering.module.scss'

type PensjonssimuleringProps = {
  uttaksalder: number
}

export function Pensjonssimulering(props: PensjonssimuleringProps) {
  const { uttaksalder } = props

  const chartRef = createRef<HTMLDivElement>()
  const aarXAxis = useMemo(() => generateXAxis(uttaksalder, 77), [uttaksalder])

  const data = {
    labels: [(uttaksalder - 1).toString(), ...aarXAxis],
    series: [
      [
        0, 250000, 300000, 450000, 500000, 600000, 600000, 600000, 600000,
        600000, 600000, 600000, 600000, 600000, 600000, 600000, 600000,
      ],
      [
        0, 90000, 70000, 100000, 80000, 70000, 70000, 70000, 70000, 70000,
        70000, 70000, 70000, 70000, 70000, 70000, 70000,
      ],
      [
        1000000, 50000, 40000, 50000, 60000, 50000, 50000, 50000, 50000, 50000,
        50000, 50000, 50000, 50000, 50000, 50000, 50000,
      ],
    ],
  }

  const options = {
    stackBars: true,
    axisX: {
      labelInterpolationFnc: (value: string, index: number) =>
        index === aarXAxis.length ? `${value}+` : value,
    },
    axisY: {
      offset: 25,
      scaleMinSpace: 15,
      labelInterpolationFnc: (value: number) => `  ${value / 1000}`,
    },
  }

  useEffect(() => {
    if (chartRef.current) {
      new BarChart(chartRef.current, data, options)
      const chartWrapper = chartRef.current
      /* c8 ignore start */
      chartWrapper.addEventListener('scroll', function () {
        document
          .querySelectorAll('.ct-label.ct-vertical.ct-start')
          .forEach((el) => {
            ;(el as HTMLElement).style.position = 'absolute'
            ;(el as HTMLElement).style.left = `${
              chartWrapper.scrollLeft - 15
            }px`
            ;(el as HTMLElement).style.minWidth = '30px'
            ;(el as HTMLElement).style.backgroundColor = 'white'
          })
      })
      /* c8 ignore end */
    }
  }, [uttaksalder])

  return (
    <>
      {uttaksalder && (
        <>
          <Heading size="xsmall" level="3" spacing>
            Årlig pensjon hvis du starter uttak ved {uttaksalder} år
          </Heading>
          <div
            className={clsx('ct-chart', styles.chartWrapper)}
            ref={chartRef}
          />
        </>
      )}
    </>
  )
}
