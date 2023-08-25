import { Accordion, BodyLong } from '@navikt/ds-react'

import { formatUttaksalder } from '@/components/VelgUttaksalder/utils'

import { SectionContent } from './components/SectionContent'
import { SectionHeader } from './components/SectionHeader'
interface Props {
  uttaksalder: Uttaksalder
}

export function TidligstMuligUttak({ uttaksalder }: Props) {
  return (
    <Accordion.Item>
      <SectionHeader
        label="Tidligst mulig uttak"
        value={formatUttaksalder(uttaksalder, { compact: true })}
      />
      <SectionContent>
        <BodyLong>
          Når du velger hvilken alder du ønsker ta ut pensjon er det alltid
          måneden etter du fyller år som blir brukt i beregningen. Velger du for
          eksempel 62 år, betyr det måneden etter du fyller 62 år. <br />
          <br />
          For å starte uttak før 67 år må opptjeningen være høy nok, og det vil
          derfor ikke være alle som har mulighet til å starte uttak ved 62 år.
          Tidspunktet som er oppgitt er ett estimat på når du tidligst kan
          starte uttak av 100 % alderspensjon basert på din pensjonsopptjening
          og opplysninger du har gitt.
          <br />
          <br />
          Tidspunktet kan bli endret hvis din inntekt endrer seg, og ut fra om
          du har rett til AFP i privat eller offentlig sektor. Du bør derfor
          sjekke igjen når det nærmer seg at du ønsker å starte alderspensjon.
        </BodyLong>
      </SectionContent>
    </Accordion.Item>
  )
}
