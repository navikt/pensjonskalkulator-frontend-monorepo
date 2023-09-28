import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { getNesteSide } from '../Step4/utils'
import { Card } from '@/components/common/Card'
import { paths } from '@/router/routes'
import { useGetInntektQuery, useGetPersonQuery } from '@/state/api/apiSlice'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { checkHarSamboer } from '@/utils/sivilstand'
export function StepFeil() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const {
    data: person,
    isLoading: isPersonLoading,
    isSuccess: isPersonSuccess,
  } = useGetPersonQuery()
  const { isLoading: isInntektLoading, isSuccess: isInntektSuccess } =
    useGetInntektQuery()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.uventet_feil',
    })
  }, [])

  React.useEffect(() => {
    if (isInntektSuccess && isPersonSuccess) {
      const url = getNesteSide(checkHarSamboer(person.sivilstand))
      navigate(url)
    }
  }, [isInntektSuccess, isPersonSuccess, person])

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.login)
  }

  return (
    <Card
      data-testid="error-step-unexpected"
      aria-live="polite"
      hasLargePadding
      hasMargin
    >
      <Card.Content
        isLoading={isInntektLoading || isPersonLoading}
        text={{
          loading: 'loading.person',
          header: 'error.global.title',
          ingress: 'error.global.ingress',
          primaryButton: 'error.global.button',
        }}
        onPrimaryButtonClick={onCancel}
      />
    </Card>
  )
}
