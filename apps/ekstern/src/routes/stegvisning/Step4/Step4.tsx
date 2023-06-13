import { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Loader } from '@/components/Loader'
import { AFP } from '@/components/stegvisning/AFP'
import { useGetTpoMedlemskapQuery } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamtykke } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step4() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykket = useAppSelector(selectSamtykke)
  const {
    data: TpoMedlemskap,
    isLoading,
    isSuccess,
  } = useGetTpoMedlemskapQuery(undefined, { skip: !harSamtykket })

  useEffect(() => {
    // Dersom brukeren prøver å aksessere steget direkte uten å ha svart på samtykke spørsmålet sendes den til samtykke steget
    if (harSamtykket === null) {
      return navigate('/samtykke')
    }
  }, [])

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate('/')
  }

  const onPrevious = (): void => {
    // TODO: hva skjer dersom tpo medlemskap feiler? Sender vi da tilbake til samtykke?
    if (isSuccess && TpoMedlemskap.harAktivMedlemskap) {
      return navigate('/offentlig-tp')
    } else {
      return navigate('/samtykke')
    }
  }

  const onNext = (): void => {
    navigate('/beregning')
  }

  return isLoading ? (
    <Loader
      data-testid="loader"
      size="3xlarge"
      title={
        <FormattedMessage id="stegvisning.stegvisning.offentligtp.title" />
      }
    />
  ) : (
    <AFP
      showJaOffentligChoice={
        !harSamtykket || (isSuccess && TpoMedlemskap.harAktivMedlemskap)
      }
      onCancel={onCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}
