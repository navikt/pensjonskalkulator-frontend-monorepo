import React from 'react'

import { Accordion, Link } from '@navikt/ds-react'

import { SectionHeader } from './components/SectionHeader'

interface Props {
  uttak: Uttaksalder
}

export function TidligstMuligUttak({ uttak }: Props) {
  return (
    <Accordion.Item>
      <SectionHeader
        label="Tidligst mulig uttak"
        value={
          uttak.maaned === 0
            ? `${uttak.aar} år`
            : `${uttak.aar} år, ${uttak.maaned} md.`
        }
      />
      <Accordion.Content>
        Viser første mulige tidspunkt for uttak av 100 % alderspensjon.
        Tidspunktet kan bli endret dersom din inntekt endrer seg. Selv om du
        ikke kan ta ut 100 % alderspensjon på det tidspunktet du ønsker, kan det
        være du har mulighet til å starte uttak av en lavere uttaksgrad.
        <br />
        <br />
        Rett til AFP i privat eller offentlig sektor kan også ha betydning for
        når du tidligst kan starte uttak av pensjon. Vær oppmerksom på at dersom
        du ikke har rett til AFP, vil det kunne påvirke resultatet ditt.
        <br />
        <br />
        Hvorfor kan du ikke starte uttak tidligere: For å ta ut alderspensjon
        før du har fylt 67 år, må du ha tilstrekkelig høy opptjening. Ved helt
        eller delvis uttak før 67 år, må opptjeningen være så høy at pensjonen
        ved fylte 67 år minst tilsvarer
        <Link>garantipensjonsnivået</Link>. Fra fylte 67 år har alle med
        opptjente pensjonsrettigheter rett til å starte alderspensjon.
        <br />
        <br />
        Tidspunktet er et estimat og du bør sjekke igjen når tidspunktet nærmer
        seg.
      </Accordion.Content>
    </Accordion.Item>
  )
}
