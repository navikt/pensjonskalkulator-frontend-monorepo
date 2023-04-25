import React from 'react'

import { Accordion, Link } from '@navikt/ds-react'

import { SectionHeader } from './components/SectionHeader'

interface Props {
  sivilstand: Sivilstand
}

export function Sivilstand({ sivilstand }: Props) {
  return (
    <Accordion.Item>
      <SectionHeader
        label="Sivilstand"
        value={`${sivilstand.gift ? 'Gift' : 'Ugift'}, ${
          sivilstand.samboer ? 'bor sammen med noen' : 'bor alene'
        }`}
      />
      <Accordion.Content>
        Garantipensjon skal sikre et minste garantipensjonsnivå ved 67 år for de
        som har lav eller ingen opptjening til inntektspensjon. Størrelsen på
        garantipensjonen avhenger av din sivilstatus, og om ektefelle, partner
        eller samboer har egen inntekt eller mottar egen pensjon.{' '}
        <Link>Mer om garantipensjon og satser</Link>.
      </Accordion.Content>
    </Accordion.Item>
  )
}
