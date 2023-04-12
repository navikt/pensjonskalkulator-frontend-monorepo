import { useState, useMemo, useEffect, createRef } from 'react'

import { Heading, Chips, Label, ReadMore } from '@navikt/ds-react'
import { BarChart } from 'chartist'
import clsx from 'clsx'

import whiteSectionStyles from '../../scss/WhiteSection/WhiteSection.module.scss'

import { generateAlderArray } from './utils'

import styles from './Pensjonssimulering.module.scss'

export function Pensjonssimulering() {
  // TODO tidligst uttak vil leveres av backend. isReady flag kan erstattes med isSuccess fra RTK-query
  const tidligstUttak = 62
  const alderChips = useMemo(
    () => generateAlderArray(tidligstUttak, 75),
    [tidligstUttak]
  )
  const [uttaksalder, setUttaksalder] = useState<number | undefined>(undefined)
  const [isReady, setIsReady] = useState<boolean>(false)
  const chartRef = createRef<HTMLDivElement>()

  const data = {
    labels: alderChips,
    series: [
      [
        800000, 1000000, 900000, 600000, 800000, 800000, 1000000, 900000,
        800000, 1000000, 900000, 600000, 800000, 800000,
      ],
      [
        90000, 100000, 100000, 80000, 200000, 150000, 100000, 80000, 200000,
        100000, 80000, 100000, 90000, 150000,
      ],
      [
        100000, 200000, 50000, 60000, 100000, 200000, 90000, 60000, 100000,
        200000, 90000, 60000, 100000, 200000,
      ],
    ],
  }

  const options = {
    stackBars: true,
    // axisY: {
    //   labelInterpolationFnc: function (value: number) {
    //     return value / 1000 + 'k'
    //   },
    // },
  }

  useEffect(() => {
    /* c8 ignore start */
    setTimeout(function () {
      // TODO fikse denne sjekken og følgende tester
      if (chartRef.current) {
        new BarChart(chartRef.current, data, options)
      }
      setIsReady(true)
      /* c8 ignore end */
    }, 250)
  })

  return (
    <section
      className={clsx(
        whiteSectionStyles.whiteSection,
        styles.pensjonssimulering,
        { [whiteSectionStyles.whiteSection__isVisible]: isReady }
      )}
    >
      <Heading size="small" level="3" spacing>
        Når vil du ta ut alderspensjon?
      </Heading>
      {
        // TODO Er det semantisk korrekt å ha denne som label? Under avklaring
      }
      <Label size={'small'}>Velg alder</Label>
      <Chips
        className={`${styles.chipsWrapper} ${styles.chipsWrapper__hasGap}`}
      >
        {alderChips.slice(0, 6).map((alderChip) => (
          <Chips.Toggle
            selected={uttaksalder === alderChip}
            key={alderChip}
            onClick={() => setUttaksalder(alderChip)}
          >
            {alderChip.toString()}
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
              {alderChip.toString()}
            </Chips.Toggle>
          ))}
        </Chips>
      </ReadMore>
      {uttaksalder && (
        <Heading size="small" level="3" spacing>
          Årlig pensjon hvis du starter uttak ved {uttaksalder} år
        </Heading>
      )}
      <div className={'ct-chart'} ref={chartRef}></div>
    </section>
  )
}
