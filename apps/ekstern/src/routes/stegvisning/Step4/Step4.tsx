import { useNavigate } from 'react-router-dom'

import { AFP, AfpRadio } from '@/components/stegvisning/AFP'
import {
  useGetPersonQuery,
  useGetTpoMedlemskapQuery,
} from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamtykke, selectAfp } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

import { checkHarSamboer, getNesteSide } from './utils'

export function Step4() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykket = useAppSelector(selectSamtykke)
  const previousAfp = useAppSelector(selectAfp)
  const { data: person, isSuccess: isPersonQuerySuccess } = useGetPersonQuery()
  const { data: TpoMedlemskap, isSuccess: isTpoMedlemskapQuerySuccess } =
    useGetTpoMedlemskapQuery(undefined, { skip: !harSamtykket })

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate('/')
  }

  const onPrevious = (): void => {
    // TODO: hva skjer dersom tpo medlemskap har feilet før? sender vi tilbake til samtykke?
    if (
      isTpoMedlemskapQuerySuccess &&
      TpoMedlemskap.harTjenestepensjonsforhold
    ) {
      return navigate('/offentlig-tp')
    } else {
      return navigate('/samtykke')
    }
  }

  const onNext = (afpData: AfpRadio): void => {
    dispatch(userInputActions.setAfp(afpData))

    const harSamboer =
      isPersonQuerySuccess && person?.sivilstand
        ? checkHarSamboer(person?.sivilstand)
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
