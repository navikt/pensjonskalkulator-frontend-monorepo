import { Accordion, BodyLong, Link } from '@navikt/ds-react'

import { SectionContent } from '@/components/Grunnlag/sections/components/SectionContent'
import { SectionHeader } from '@/components/Grunnlag/sections/components/SectionHeader'

export const Utenlandsopphold = () => {
  return (
    <Accordion.Item>
      <SectionHeader label="Utenlandsopphold" value="Ingen" />
      <SectionContent>
        <BodyLong>
          Opphold i utlandet kan påvirke beregningen. Har du bodd/arbeidet
          mindre enn 40 år i Norge ved uttakstidspunktet må du bruke{' '}
          <Link>avansert kalkulator.</Link>
        </BodyLong>
      </SectionContent>
    </Accordion.Item>
  )
}
