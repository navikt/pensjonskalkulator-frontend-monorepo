import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Sivilstand } from '@/components/stegvisning/Sivilstand'
import { paths } from '@/router/constants'
import {
  useGetPersonQuery,
  useGetEkskludertStatusQuery,
} from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectSamboerFraBrukerInput,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step6() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const afp = useAppSelector(selectAfp)
  const samboerSvar = useAppSelector(selectSamboerFraBrukerInput)

  const { data: person, isSuccess } = useGetPersonQuery()
  const { data: ekskludertStatus } = useGetEkskludertStatusQuery()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step6',
    })
  }, [])

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.login)
  }

  const onPrevious = (): void => {
    const hasUfoeretrygd =
      ekskludertStatus?.ekskludert &&
      ekskludertStatus.aarsak === 'HAR_LOEPENDE_UFOERETRYGD'
    if (hasUfoeretrygd && afp && afp !== 'nei') {
      navigate(paths.ufoeretrygd)
    } else {
      navigate(paths.afp)
    }
  }

  const onNext = (sivilstandData: BooleanRadio): void => {
    dispatch(userInputActions.setSamboer(sivilstandData === 'ja'))
    navigate(paths.beregningEnkel)
  }
  return (
    <>
      {isSuccess && (
        <Sivilstand
          sivilstand={person.sivilstand}
          harSamboer={samboerSvar}
          onCancel={onCancel}
          onPrevious={onPrevious}
          onNext={onNext}
        />
      )}
    </>
  )
}
