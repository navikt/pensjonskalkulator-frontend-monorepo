import { Suspense } from 'react'
import { useNavigate, Await } from 'react-router-dom'

import { Loader } from '@/components/Loader'
import { OffentligTP } from '@/components/stegvisning/OffentligTP'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'

import { TpoMedlemskapQuery, useStep3LoaderData } from './utils'

export function Step3() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const loaderData = useStep3LoaderData()

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate('/')
  }

  const onPrevious = (): void => {
    navigate('/samtykke')
  }

  const onNext = (): void => {
    navigate('/afp')
  }

  return (
    <>
      <Suspense fallback={<Loader data-testid="loader" size="3xlarge" />}>
        <Await
          resolve={loaderData.getTpoMedlemskapQuery}
          // errorElement={} //TODO PEK-98 hva gjør vi når kall til tp-registret feiler?
        >
          {(getTpoMedlemskapQuery: TpoMedlemskapQuery) => {
            return (
              <OffentligTP
                shouldJumpOverStep={
                  getTpoMedlemskapQuery.isSuccess &&
                  !getTpoMedlemskapQuery.data.harTjenestepensjonsforhold
                }
                onCancel={onCancel}
                onPrevious={onPrevious}
                onNext={onNext}
              />
            )
          }}
        </Await>
      </Suspense>
    </>
  )
}
