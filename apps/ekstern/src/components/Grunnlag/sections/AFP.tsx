import React from 'react'

import { Accordion, Link } from '@navikt/ds-react'

import { SectionHeader } from './components/SectionHeader'

export function AFP() {
  return (
    <Accordion.Item>
      <SectionHeader label="AFP" />
      <Accordion.Content>
        NAV har ikke vurdert om du fyller inngangsvilkårene for å få AFP, men
        forutsetter at du har rett til pensjonen du beregner.
        <br />
        <br />
        Hvis du har spørsmål om du har rett til AFP i privat sektor, må du
        kontakte <Link>Fellesordningen for AFP</Link>. Hvis du har spørsmål om
        du har rett til AFP i offentlig sektor, må du kontakte din
        tjenestepensjonsordning.
      </Accordion.Content>
    </Accordion.Item>
  )
}
