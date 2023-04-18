import { useState, useMemo, useEffect, createRef } from 'react'

import { Heading, Chips, ReadMore } from '@navikt/ds-react'
import { BarChart } from 'chartist'
import clsx from 'clsx'

import whiteSectionStyles from '../../scss/WhiteSection/WhiteSection.module.scss'

import { generateAlderArray } from './utils'

import styles from './Pensjonssimulering.module.scss'

export function Pensjonssimulering() {
  // TODO tidligst uttak vil leveres av backend. isReady flag kan erstattes med isSuccess fra RTK-query
  const tidligstUttak = 62
  const alderChips = useMemo(
    () => generateAlderArray(tidligstUttak, 77),
    [tidligstUttak]
  )

  const [uttaksalder, setUttaksalder] = useState<string | undefined>(undefined)
  const [isReady, setIsReady] = useState<boolean>(false)
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
    /* c8 ignore start */
    // TODO Dette er kun midlertidig for å simulere at blokken fades inn på en smooth måte med css transition
    setTimeout(function () {
      setIsReady(true)
    }, 250)
    /* c8 ignore end */
    if (chartRef.current) {
      new BarChart(chartRef.current, data, options)
      const chartWrapper = chartRef.current
      chartWrapper.addEventListener('scroll', function (evt) {
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
    <section
      className={clsx(
        whiteSectionStyles.whiteSection,
        styles.pensjonssimulering,
        { [whiteSectionStyles.whiteSection__isVisible]: isReady }
      )}
    >
      <Heading size="xsmall" level="2" spacing>
        Når vil du ta ut alderspensjon?
      </Heading>
      <Chips
        className={`${styles.chipsWrapper} ${styles.chipsWrapper__hasGap}`}
      >
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
          className={`${styles.chipsWrapper} ${styles.chipsWrapper__hasGap}`}
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
            className={`ct-chart ${styles.chartWrapper}`}
            ref={chartRef}
          ></div>
        </>
      )}
    </section>
  )
}
