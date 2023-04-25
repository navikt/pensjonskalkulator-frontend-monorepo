import React from 'react'

import { Accordion, Link } from '@navikt/ds-react'

import { formatAsDecimal } from '@/utils/currency'

import { SectionHeader } from './components/SectionHeader'

interface Props {
  alderspensjon: number
}

export function Alderspensjon({ alderspensjon }: Props) {
  return (
    <Accordion.Item>
      <SectionHeader
        label="Alderspensjon"
        value={`${formatAsDecimal(alderspensjon)} kr`}
      />
      <Accordion.Content>
        Beløpet er alderspensjon som du får første hele året du får full
        alderspensjon. Alderspensjon beregnes ut ifra{' '}
        <Link>din pensjonsbeholdning</Link>.
        <br />
        <br />
        Andre faktorer som kan påvirke størrelsen på alderspensjon er når du
        velger å ta ut pensjonen, hvilken uttaksgrad du velger, sivilstand og
        hvor lenge du har bodd i Norge (vi har forutsatt at du har bodd i Norge
        hele ditt liv, og bor i Norge fram til uttak av pensjon). Har du
        bodd/arbeidet mindre enn 40 år i Norge ved uttakstidspunktet eller vil
        endre noen av de andre ovennevnte faktorene, må du bruke
        <Link>avansert kalkulator</Link>. Der vil du også finne mer detaljer om
        hvordan din pensjon er beregnet.
      </Accordion.Content>
    </Accordion.Item>
  )
}
