import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Card } from '../common/Card'
import { externalUrls, paths } from '@/router/constants'
import { apiSlice } from '@/state/api/apiSlice'
import { useAppDispatch } from '@/state/hooks'
import { wrapLogger } from '@/utils/logging'

const gaaTilDetaljertKalkulator = () => {
  window.open(externalUrls.detaljertKalkulator, '_self')
}

export const Henvisning1963: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const intl = useIntl()

  const onAvbryt = (): void => {
    dispatch(apiSlice.util.resetApiState())
    navigate(paths.login)
  }

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.henvisning_1963',
    })
  }, [])

  return (
    <Card
      data-testid="henvisning-1963"
      aria-live="polite"
      hasLargePadding
      hasMargin
    >
      <Card.Content
        text={{
          header: 'error.du_kan_ikke_bruke_enkel_kalkulator',
          ingress: 'henvisning1963.body',
          primaryButton: 'henvisning1963.detaljert_kalkulator',
          secondaryButton: 'stegvisning.avbryt',
        }}
        onPrimaryButtonClick={wrapLogger('button klikk', { tekst: 'Tilbake' })(
          gaaTilDetaljertKalkulator
        )}
        onSecondaryButtonClick={wrapLogger('button klikk', { tekst: 'Avbryt' })(
          onAvbryt
        )}
      />
    </Card>
  )
}
