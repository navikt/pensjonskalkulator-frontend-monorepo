import React from 'react'

import { Accordion, BodyLong } from '@navikt/ds-react'

import { formatAsDecimal } from '@/utils/currency'

import { SectionHeader } from './components/SectionHeader'
import { SectionContent } from './components/SectionContent'

interface Props {
  inntekt: number
}

export function Inntekt({ inntekt }: Props) {
  return (
    <Accordion.Item>
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
    </Accordion.Item>
  )
}
