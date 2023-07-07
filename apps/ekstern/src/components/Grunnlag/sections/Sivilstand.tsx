import { useMemo } from 'react'

import { Accordion, BodyLong, Link } from '@navikt/ds-react'

import { useGetPersonQuery } from '@/state/api/apiSlice'

import { SectionContent } from './components/SectionContent'
import { SectionHeader } from './components/SectionHeader'
import { formatSivilstand } from './Sivilstand-utils'

export function Sivilstand() {
  const { data: person, isSuccess } = useGetPersonQuery()

  const formatertSivilstand = useMemo(
    () =>
      person && person.sivilstand ? formatSivilstand(person.sivilstand) : '',
    [person]
  )

  return (
    <Accordion.Item data-testid="accordion-sivilstand">
      <SectionHeader
        label="Sivilstand"
        value={
          isSuccess && person.sivilstand !== null
            ? formatertSivilstand
            : 'Kunne ikke hentes'
        }
      />
      <SectionContent>
        <BodyLong>
          Garantipensjon skal sikre et minste garantipensjonsnivå ved 67 år for
          de som har lav eller ingen opptjening til inntektspensjon. Størrelsen
          på garantipensjonen avhenger av din sivilstatus, og om ektefelle,
          partner eller samboer har egen inntekt eller mottar egen pensjon.{' '}
          <Link>Mer om garantipensjon og satser</Link>.
        </BodyLong>
      </SectionContent>
    </Accordion.Item>
  )
}
