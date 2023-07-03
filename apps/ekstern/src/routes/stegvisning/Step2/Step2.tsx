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
      dispatch(
        apiSlice.endpoints.pensjonsavtaler.initiate({
          uttaksperioder: [
            {
              startAlder: 67, // TODO PEK-94 - må resultere i en dato tidligst inneværende måned kallet blir gjort
              startMaaned: 1, // Hardkodet til 1 for nå - brukeren kan ikke velge spesifikk måned
              grad: 100, // Hardkodet til 100 for nå - brukeren kan ikke velge gradert pensjon
              aarligInntekt: 0, // Hardkodet til 0 for nå - brukeren kan ikke legge til inntekt vsa. pensjon
            },
          ],
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
