import { Suspense } from 'react'
import { useNavigate, Await } from 'react-router-dom'

import { Loader } from '@/components/components/Loader'
import { ErrorStep } from '@/components/stegvisning/ErrorStep'
import { OffentligTP } from '@/components/stegvisning/OffentligTP'
import { paths } from '@/routes'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'

import { TpoMedlemskapQuery, useStep3LoaderData } from './utils'

export function Step3() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const loaderData = useStep3LoaderData()

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.root)
  }

  const onPrevious = (): void => {
    navigate(paths.samtykke)
  }

  const onNext = (): void => {
    navigate(paths.afp)
  }

  return (
    <>
      <Suspense fallback={<Loader data-testid="loader" size="3xlarge" />}>
        <Await resolve={loaderData.getTpoMedlemskapQuery}>
          {(getTpoMedlemskapQuery: TpoMedlemskapQuery) => {
            return getTpoMedlemskapQuery.isError ? (
              <ErrorStep
                onPrimaryButtonClick={onNext}
                onSecondaryButtonClick={onPrevious}
                onCancel={onCancel}
                text={{
                  header: 'stegvisning.offentligtp.error.title',
                  ingress: 'stegvisning.offentligtp.error.ingress',
                  primaryButton: 'stegvisning.neste',
                  secondaryButton: 'stegvisning.tilbake',
                  tertiaryButton: 'stegvisning.avbryt',
                }}
              />
            ) : (
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
