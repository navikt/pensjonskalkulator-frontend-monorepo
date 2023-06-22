import React from 'react'

import { Accordion, BodyLong, Link } from '@navikt/ds-react'

import { SectionHeader } from './components/SectionHeader'
import { SectionContent } from './components/SectionContent'

export function AFP() {
  return (
    <Accordion.Item>
      <SectionHeader label="AFP" />
      <SectionContent>
        <BodyLong>
          NAV har ikke vurdert om du fyller inngangsvilkårene for å få AFP, men
          forutsetter at du har rett til pensjonen du beregner.
          <br />
          <br />
          Hvis du har spørsmål om du har rett til AFP i privat sektor, må du
          kontakte <Link>Fellesordningen for AFP</Link>. Hvis du har spørsmål om
          du har rett til AFP i offentlig sektor, må du kontakte din
          tjenestepensjonsordning.
        </BodyLong>
      </SectionContent>
    </Accordion.Item>
  )
}
