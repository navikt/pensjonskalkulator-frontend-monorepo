import React from 'react'

import { BodyLong } from '@navikt/ds-react'

import { AccordionItem } from '@/components/components/AccordionItem'
import { formatAsDecimal } from '@/utils/currency'

import { SectionContent } from './components/SectionContent'
import { SectionHeader } from './components/SectionHeader'

interface Props {
  inntekt: number
}

export function Inntekt({ inntekt }: Props) {
  return (
    <AccordionItem name="Grunnlag: Inntekt">
      <SectionHeader
        label="Inntekt"
        value={`${formatAsDecimal(inntekt)} kr før uttak`}
      />
      <SectionContent>
        <BodyLong>
          Beløpet gjelder brutto årsinntekt frem til uttak av pensjon og er
          siste pensjonsgivende inntekt mottatt fra Skatteetaten.
        </BodyLong>
      </SectionContent>
    </AccordionItem>
  )
}
