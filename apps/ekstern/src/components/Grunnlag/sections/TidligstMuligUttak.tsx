import { BodyLong, Link } from '@navikt/ds-react'

import { AccordionItem } from '@/components/common/AccordionItem'
import { formatUttaksalder } from '@/components/VelgUttaksalder/utils'
import { useTidligsteUttaksalderQuery } from '@/state/api/apiSlice'

import { SectionContent } from './components/SectionContent'
import { SectionHeader } from './components/SectionHeader'

export function TidligstMuligUttak() {
  const { data: tidligstMuligUttak, isSuccess } = useTidligsteUttaksalderQuery()

  return (
    <AccordionItem name="Grunnlag: Tidligst mulig uttak">
      <SectionHeader
        label="Tidligst mulig uttak"
        value={
          isSuccess
            ? formatUttaksalder(tidligstMuligUttak, { compact: true })
            : 'Ikke funnet'
        }
      />
      <SectionContent>
        {!tidligstMuligUttak && (
          <BodyLong>
            Vi klarte ikke å finne tidspunkt for når du tidligst kan ta ut
            alderspensjon. Prøv igjen senere.
            <br /> <br />
          </BodyLong>
        )}
        <BodyLong>
          For å starte uttak før 67 år må opptjeningen være høy nok. Alle kan
          derfor ikke starte uttak ved 62 år. Tidspunktet er et estimat på når
          du tidligst kan ta ut 100 % alderspensjon. I{' '}
          <Link href="">detaljert kalkulator</Link> kan du sjekke om du kan ta
          ut alderspensjon tidligere med en lavere uttaksgrad.
          <br />
          <br />
          Når du velger uttaksalder, bruker vi måneden etter du fyller år.
          Velger du for eksempel 62 år, betyr det måneden etter du fyller 62 år.
        </BodyLong>
      </SectionContent>
    </AccordionItem>
  )
}
