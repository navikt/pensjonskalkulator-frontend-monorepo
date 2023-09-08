import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { getNesteSide } from '../Step4/utils'
import { Card } from '@/components/common/Card'
import { externalUrls } from '@/router/routes'
import { useGetPersonQuery } from '@/state/api/apiSlice'
import { apiSlice } from '@/state/api/apiSlice'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { checkHarSamboer } from '@/utils/sivilstand'

export function Step5Feil() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: person, isLoading, isSuccess } = useGetPersonQuery()

  const onNext = (harSamboer: boolean): void => {
    if (harSamboer) {
      dispatch(userInputActions.setSamboer(true))
    }
    const url = getNesteSide(harSamboer)
    navigate(url)
  }

  useEffect(() => {
    if (isSuccess) {
      onNext(checkHarSamboer(person.sivilstand))
    }
  }, [isSuccess, person])

  const onCancel = (): void => {
    window.location.href = externalUrls.dinPensjon
  }

  const onReload = (): void => {
    dispatch(apiSlice.util.invalidateTags(['Person']))
    dispatch(apiSlice.endpoints.getPerson.initiate())
  }

  return (
    <Card aria-live="polite" hasLargePadding hasMargin>
      <Card.Content
        text={{
          loading: 'loading.person',
          header: 'error.global.title',
          ingress: 'error.global.ingress',
          primaryButton: 'error.global.button.primary',
          secondaryButton: 'error.global.button.secondary',
        }}
        isLoading={isLoading}
        onPrimaryButtonClick={onReload}
        onSecondaryButtonClick={onCancel}
      />
    </Card>
  )
}
