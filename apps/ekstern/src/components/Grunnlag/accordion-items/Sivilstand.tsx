import { useMemo } from 'react'

import { Accordion, Alert, BodyLong, Link } from '@navikt/ds-react'

import { formatSivilstand } from '@/components/Grunnlag/accordion-items/Sivilstand-utils'
import { useGetPersonQuery } from '@/state/api/apiSlice'

import { SectionHeader } from './components/SectionHeader'

export function Sivilstand() {
  const { data: person, isError, isLoading, isSuccess } = useGetPersonQuery()

  const formatertSivilstand = useMemo(
    () => (person ? formatSivilstand(person.sivilstand) : ''),
    [person]
  )

  if (isLoading) {
    return null
  }

  if (isError || !isSuccess) {
    return <Alert variant="error">Kunne ikke hente sivilstand</Alert>
  }

  return (
    <Accordion.Item data-testid={'accordion-sivilstand'}>
      <SectionHeader label="Sivilstand" value={formatertSivilstand} />
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
