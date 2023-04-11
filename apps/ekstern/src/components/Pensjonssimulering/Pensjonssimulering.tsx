import { useState, useMemo, useEffect } from 'react'

import { Heading, Chips } from '@navikt/ds-react'
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
      <Chips>
        {alderChips.map((alderChip) => (
          <Chips.Toggle
            selected={uttaksalder === alderChip}
            key={alderChip}
            onClick={() => setUttaksalder(alderChip)}
          >
            {alderChip.toString()}
          </Chips.Toggle>
        ))}
      </Chips>
    </section>
  )
}
