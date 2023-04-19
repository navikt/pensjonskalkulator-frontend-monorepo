import { createRef, useEffect, useMemo, useState } from 'react'

import { Chips, Heading, ReadMore } from '@navikt/ds-react'
import { BarChart } from 'chartist'
import clsx from 'clsx'

import { generateAlderArray } from './utils'

import styles from './Pensjonssimulering.module.scss'

export function Pensjonssimulering() {
  // TODO hente tidligst uttak fra Redux Store
  const tidligstUttak = 62
  const alderChips = useMemo(
    () => generateAlderArray(tidligstUttak, 77),
    [tidligstUttak]
  )

  const [uttaksalder, setUttaksalder] = useState<string | undefined>(undefined)
  const chartRef = createRef<HTMLDivElement>()

  const data = {
    labels: [(tidligstUttak - 1).toString(), ...alderChips],
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
        index === alderChips.length ? `${value}+` : value,
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
    }
  }, [uttaksalder])

  return (
    <>
      <Heading size="xsmall" level="2">
        Når vil du ta ut alderspensjon?
      </Heading>
      <Chips className={clsx(styles.chipsWrapper, styles.chipsWrapper__hasGap)}>
        {alderChips.slice(0, 6).map((alderChip) => (
          <Chips.Toggle
            selected={uttaksalder === alderChip}
            key={alderChip}
            onClick={() => setUttaksalder(alderChip)}
          >
            {`${alderChip.toString()} år`}
          </Chips.Toggle>
        ))}
      </Chips>
      <ReadMore
        header="Vis flere aldere"
        className={clsx({ [styles.readMore__hasPadding]: uttaksalder })}
      >
        <Chips
          className={clsx(styles.chipsWrapper, styles.chipsWrapper__hasGap)}
        >
          {alderChips.slice(6, alderChips.length).map((alderChip) => (
            <Chips.Toggle
              selected={uttaksalder === alderChip}
              key={alderChip}
              onClick={() => setUttaksalder(alderChip)}
            >
              {`${alderChip.toString()} år`}
            </Chips.Toggle>
          ))}
        </Chips>
      </ReadMore>
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
