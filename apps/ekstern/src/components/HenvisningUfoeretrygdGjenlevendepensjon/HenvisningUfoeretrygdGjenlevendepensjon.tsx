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

export const HenvisningUfoeretrygdGjenlevendepensjon: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const intl = useIntl()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.henvisning_ufoere_gjenlevende',
    })
  }, [])

  const onAvbryt = (): void => {
    dispatch(apiSlice.util.resetApiState())
    navigate(paths.login)
  }

  return (
    <Card
      data-testid="henvisning-ufoere-gjenlevende"
      aria-live="polite"
      hasLargePadding
      hasMargin
    >
      <Card.Content
        text={{
          header: 'error.du_kan_ikke_bruke_enkel_kalkulator',
          ingress: 'henvisning_ufoere_gjenlevende.body',
          primaryButton: 'henvisning_ufoere_gjenlevende.detaljert_kalkulator',
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
