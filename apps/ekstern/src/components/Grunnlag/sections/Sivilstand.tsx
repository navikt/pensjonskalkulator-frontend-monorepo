import React from 'react'

import { Accordion, Alert, BodyLong, Link } from '@navikt/ds-react'

import { formatSivilstand } from '@/components/Grunnlag/sections/Sivilstand-utils'
import { useGetPersonQuery } from '@/state/api/apiSlice'

import { SectionHeader } from './components/SectionHeader'

export function Sivilstand() {
  const { data: person, isError, isLoading, isSuccess } = useGetPersonQuery()

  if (isLoading) {
    return null
  }

  if (isError || !isSuccess) {
    return <Alert variant="error">Kunne ikke hente sivilstand</Alert>
  }

  return (
    <Accordion.Item>
      <SectionHeader
        label="Sivilstand"
        value={formatSivilstand(person.sivilstand)}
      />
      <Accordion.Content>
        <BodyLong>
          Garantipensjon skal sikre et minste garantipensjonsnivå ved 67 år for
          de som har lav eller ingen opptjening til inntektspensjon. Størrelsen
          på garantipensjonen avhenger av din sivilstatus, og om ektefelle,
          partner eller samboer har egen inntekt eller mottar egen pensjon.{' '}
          <Link>Mer om garantipensjon og satser</Link>.
        </BodyLong>
      </Accordion.Content>
    </Accordion.Item>
  )
}
