import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Loader } from '@/components/common/Loader'
import { Ufoere } from '@/components/stegvisning/Ufoere'
import { paths } from '@/router/constants'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step5() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step5',
    })
  }, [])

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.login)
  }

  const onPrevious = (): void => {
    // TODO logikk for å gå tilbake til paths.ufoeretrygd ved behov
    return navigate(paths.afp)
  }

  const onNext = (): void => {
    navigate(paths.sivilstand)
  }

  // <div style={{ width: '100%' }}>
  //   <Loader
  //     data-testid="step5-loader"
  //     size="3xlarge"
  //     title={intl.formatMessage({ id: 'pageframework.loading' })}
  //     isCentered
  //   />
  // </div>

  return <Ufoere onCancel={onCancel} onPrevious={onPrevious} onNext={onNext} />
}
