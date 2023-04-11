import { useState, useMemo } from 'react'

import { Heading, Chips } from '@navikt/ds-react'

import { generateAlderArray } from './utils'

import styles from './Pensjonssimulering.module.scss'

export function Pensjonssimulering() {
  const startAlder = 62
  const alderChips = useMemo(
    () => generateAlderArray(startAlder, 75),
    [startAlder]
  )
  const [uttaksalder, setUttaksalder] = useState<number>(startAlder)

  return (
    <section className={styles.pensjonssimulering}>
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
