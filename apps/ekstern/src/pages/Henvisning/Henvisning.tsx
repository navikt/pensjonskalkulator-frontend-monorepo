import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate, useParams } from 'react-router'

import { externalUrls, henvisningUrlParams, paths } from '@/router/constants'
import { apiSlice } from '@/state/api/apiSlice'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { wrapLogger } from '@/utils/logging'

import { Card } from '../../components/common/Card'

const gaaTilDetaljertKalkulator = () => {
  window.open(externalUrls.detaljertKalkulator, '_self')
}

export const Henvisning: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const intl = useIntl()

  const { id } = useParams()

  const [ingress, setIngress] = React.useState<string>('')

  React.useEffect(() => {
    switch (id) {
      case henvisningUrlParams.apotekerne:
        document.title = intl.formatMessage({
          id: 'application.title.henvisning.apotekerne',
        })
        setIngress('henvisning.apotekerne.body')
        break
      default:
        setIngress('')
    }
  }, [id])

  const onAvbryt = (): void => {
    dispatch(apiSlice.util.resetApiState())
    dispatch(userInputActions.flush())
    navigate(paths.login)
  }

  return (
    <Card data-testid="henvisning" aria-live="polite" hasLargePadding hasMargin>
      <Card.Content
        text={{
          header: 'error.du_kan_ikke_bruke_enkel_kalkulator',
          ingress,
          primaryButton: 'henvisning.detaljert_kalkulator',
          secondaryButton: 'stegvisning.avbryt',
        }}
        onPrimaryButtonClick={wrapLogger('button klikk', {
          tekst: `Tilbake fra ${paths.henvisning}`,
        })(gaaTilDetaljertKalkulator)}
        onSecondaryButtonClick={wrapLogger('button klikk', { tekst: 'Avbryt' })(
          onAvbryt
        )}
      />
    </Card>
  )
}
