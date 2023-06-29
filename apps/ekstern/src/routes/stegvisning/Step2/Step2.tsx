import { useNavigate } from 'react-router-dom'

import { Samtykke, SamtykkeRadio } from '@/components/stegvisning/Samtykke'
import { apiSlice } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamtykke } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step2() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykket = useAppSelector(selectSamtykke)

  const onNext = (samtykkeData: SamtykkeRadio) => {
    const samtykke = samtykkeData === 'ja'
    dispatch(userInputActions.setSamtykke(samtykke))
    if (samtykke) {
      // TODO fylle ut riktig informasjon for henting av pensjonsavtaler
      dispatch(
        apiSlice.endpoints.pensjonsavtaler.initiate({
          aarligInntektFoerUttak: 0,
          uttaksperiode: {
            startAlder: 0,
            startMaaned: 0,
            grad: 100,
            aarligInntekt: 500000,
          },
          antallInntektsaarEtterUttak: 0,
        })
      )
    } else {
      dispatch(apiSlice.util.resetApiState())
    }
    navigate('/offentlig-tp')
  }

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate('/')
  }

  const onPrevious = (): void => {
    dispatch(userInputActions.flush())
    navigate('/start')
  }

  return (
    <Samtykke
      harSamtykket={harSamtykket}
      onCancel={onCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}
