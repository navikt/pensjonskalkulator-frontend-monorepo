import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Samtykke } from '@/components/stegvisning/Samtykke'
import { paths } from '@/router/constants'
import { apiSlice, useGetUfoeregradQuery } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectSamtykke,
  selectHarHentetTpoMedlemskap,
  selectIsVeileder,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step6() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykket = useAppSelector(selectSamtykke)
  const afp = useAppSelector(selectAfp)
  const shouldFlush = useAppSelector(selectHarHentetTpoMedlemskap)
  const isVeileder = useAppSelector(selectIsVeileder)

  const { data: ufoeregrad } = useGetUfoeregradQuery()
  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step6',
    })
  }, [])

  const onNext = (samtykkeData: BooleanRadio) => {
    const samtykke = samtykkeData === 'ja'
    dispatch(userInputActions.setSamtykke(samtykke))
    if (shouldFlush && !samtykke) {
      apiSlice.util.invalidateTags(['TpoMedlemskap', 'Pensjonsavtaler'])
    }
    navigate(paths.beregningEnkel)
  }

  const onCancel = isVeileder
    ? undefined
    : (): void => {
        dispatch(userInputActions.flush())
        navigate(paths.login)
      }

  const onPrevious = (): void => {
    if (ufoeregrad?.ufoeregrad && afp && afp !== 'nei') {
      navigate(paths.ufoeretrygdAFP)
    } else if (ufoeregrad?.ufoeregrad === 0 && afp === 'ja_offentlig') {
      navigate(paths.samtykkeOffentligAFP)
    } else {
      navigate(paths.afp)
    }
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
