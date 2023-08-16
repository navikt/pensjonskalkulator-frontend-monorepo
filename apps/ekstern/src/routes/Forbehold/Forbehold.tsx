import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import { Heading } from '@navikt/ds-react'

import { ResponsiveCard } from '@/components/components/ResponsiveCard'

export function Forbehold() {
  const intl = useIntl()

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.forbehold',
    })
  }, [])

  return (
    <ResponsiveCard hasLargePadding hasMargin>
      <Heading size="medium" level="2" spacing>
        Forbehold
      </Heading>
    </ResponsiveCard>
  )
}
