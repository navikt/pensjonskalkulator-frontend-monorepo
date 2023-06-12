import { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Loader } from '@/components/Loader'
import { OffentligTP } from '@/components/stegvisning/OffentligTP'
import { useGetTpoMedlemskapQuery } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamtykke } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step3() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykket = useAppSelector(selectSamtykke)
  const {
    data: TpoMedlemskap,
    isLoading,
    isSuccess,
  } = useGetTpoMedlemskapQuery(undefined, { skip: !harSamtykket })

  useEffect(() => {
    // Dersom brukeren prøver å aksessere steget direkte sendes den til samtykke steget
    if (harSamtykket === null) {
      return navigate('/samtykke')
    }
    // Dersom brukeren ikke samtykker til henting av tpo, eller at den samtykker og at den ikke har noe aktiv tpo-medlemskap behøver ikke dette steget å vises
    if (!harSamtykket || (isSuccess && !TpoMedlemskap.harAktivMedlemskap)) {
      return navigate('/afp')
    }
  }, [isSuccess])

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate('/')
  }

  const onPrevious = (): void => {
    navigate('/samtykke')
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
    <OffentligTP onCancel={onCancel} onPrevious={onPrevious} onNext={onNext} />
  )
}
