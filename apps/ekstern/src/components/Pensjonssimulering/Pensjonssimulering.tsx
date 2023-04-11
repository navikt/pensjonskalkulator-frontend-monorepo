import { useState, useMemo, useEffect } from 'react'

import { Heading, Chips, Label, ReadMore } from '@navikt/ds-react'
import clsx from 'clsx'

import whiteSectionStyles from '../../scss/WhiteSection/WhiteSection.module.scss'

import { generateAlderArray } from './utils'

import styles from './Pensjonssimulering.module.scss'

export function Pensjonssimulering() {
  const startAlder = 62
  const alderChips = useMemo(
    () => generateAlderArray(startAlder, 75),
    [startAlder]
  )
  const [uttaksalder, setUttaksalder] = useState<number>(startAlder)
  const [isReady, setIsReady] = useState<boolean>(false)

  useEffect(() => {
    setTimeout(function () {
      setIsReady(true)
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
      <ReadMore header="Vis flere aldere">
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
    </section>
  )
}
