import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import { Heading } from '@navikt/ds-react'

import { Card } from '@/components/common/Card'

export function Personopplysninger() {
  const intl = useIntl()

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.personopplysninger',
    })
  }, [])

  return (
    <Card hasLargePadding hasMargin>
      <Heading level="2" size="medium" spacing>
        Personopplysninger
      </Heading>
    </Card>
  )
}
