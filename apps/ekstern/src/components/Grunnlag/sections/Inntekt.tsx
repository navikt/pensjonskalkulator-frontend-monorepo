import React from 'react'

import { Accordion, BodyLong } from '@navikt/ds-react'
import AccordionContent from '@navikt/ds-react/esm/accordion/AccordionContent'

import { formatAsDecimal } from '@/utils/currency'

import { SectionHeader } from './components/SectionHeader'

interface Props {
  inntekt: number
}

export function Inntekt({ inntekt }: Props) {
  return (
    <Accordion.Item>
      <SectionHeader label="Inntekt" value={`${formatAsDecimal(inntekt)} kr`} />
      <AccordionContent>
        <BodyLong>
          Beløpet gjelder brutto årsinntekt frem til uttak av pensjon og er
          siste pensjonsgivende inntekt mottatt fra Skatteetaten.
        </BodyLong>
      </AccordionContent>
    </Accordion.Item>
  )
}
