import { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { AFP } from '@/components/stegvisning/AFP'
import { paths } from '@/routes'
import {
  useGetPersonQuery,
  useGetTpoMedlemskapQuery,
} from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamtykke, selectAfp } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { checkHarSamboer } from '@/utils/sivilstand'

import { getNesteSide } from './utils'

export function Step4() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykket = useAppSelector(selectSamtykke)
  const previousAfp = useAppSelector(selectAfp)
  const { data: person, isSuccess: isPersonQuerySuccess } = useGetPersonQuery()
  const { data: TpoMedlemskap, isSuccess: isTpoMedlemskapQuerySuccess } =
    useGetTpoMedlemskapQuery(undefined, { skip: !harSamtykket })

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step4',
    })
  }, [])

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.root)
  }

  const onPrevious = (): void => {
    if (
      isTpoMedlemskapQuerySuccess &&
      TpoMedlemskap.harTjenestepensjonsforhold
    ) {
      return navigate(paths.offentligTp)
    } else {
      return navigate(paths.samtykke)
    }
  }

  const onNext = (afpData: AfpRadio): void => {
    dispatch(userInputActions.setAfp(afpData))

    const harSamboer = isPersonQuerySuccess
      ? checkHarSamboer(person.sivilstand)
      : null
    if (harSamboer) {
      dispatch(userInputActions.setSamboer(true))
    }
    navigate(getNesteSide(harSamboer))
  }

  return (
    <AFP
      afp={previousAfp}
      onCancel={onCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}
