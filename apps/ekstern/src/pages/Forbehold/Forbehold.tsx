import {
  SanityContext,
  SanityForbehold,
} from '@pensjonskalkulator-frontend-monorepo/sanity'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Card } from '@/components/common/Card'

export function Forbehold() {
  const intl = useIntl()
  const { forbeholdAvsnittData } = React.useContext(SanityContext)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.forbehold',
    })
  }, [])

  return (
    <Card hasLargePadding hasMargin>
      <SanityForbehold
        avsnitt={forbeholdAvsnittData}
        title={<FormattedMessage id="forbehold.title" />}
        avsnittTestId="forbehold-avsnitt"
      />
    </Card>
  )
}
