import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Alert, Link } from '@navikt/ds-react'

import { useAppSelector } from '@/state/hooks'
import { selectFoedselsdato } from '@/state/userInput/selectors'
import { isFoedtFoer1963 } from '@/utils/alder'

const RegjeringenLink = (chunks: React.ReactNode) => (
  <Link
    href="https://www.regjeringen.no"
    target="_blank"
    rel="noopener noreferrer"
  >
    {chunks}
  </Link>
)

export const RevidertBudsjettAlert: React.FC = () => {
  const foedselsdato = useAppSelector(selectFoedselsdato)

  if (!foedselsdato || !isFoedtFoer1963(foedselsdato)) {
    return null
  }

  return (
    <div
      style={{
        width: '100vw',
      }}
    >
      <Alert
        variant="info"
        contentMaxWidth={false}
        data-testid="revidert-budsjett-alert"
        style={{ marginLeft: -1, marginRight: -1, borderRadius: 0 }}
      >
        <FormattedMessage
          id="beregning.revidert_budsjett.alert"
          values={{
            link: RegjeringenLink,
          }}
        />
      </Alert>
    </div>
  )
}
