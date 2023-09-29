import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import {
  Sivilstand,
  SivilstandRadio,
} from '@/components/stegvisning/Sivilstand'
import { paths } from '@/router'
import { useGetPersonQuery } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamboerFraBrukerInput } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step5() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: person, isSuccess } = useGetPersonQuery()
  const samboerSvar = useAppSelector(selectSamboerFraBrukerInput)

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
    return navigate(paths.afp)
  }

  const onNext = (sivilstandData: SivilstandRadio): void => {
    dispatch(userInputActions.setSamboer(sivilstandData === 'ja'))
    navigate(paths.beregning)
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
