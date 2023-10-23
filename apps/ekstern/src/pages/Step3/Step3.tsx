import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate, Await } from 'react-router-dom'

import { Card } from '@/components/common/Card'
import { Loader } from '@/components/common/Loader'
import { OffentligTP } from '@/components/stegvisning/OffentligTP'
import { paths } from '@/router'
import {
  TpoMedlemskapQuery,
  useTpoMedlemskapAccessData,
} from '@/router/loaders'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step3() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const loaderData = useTpoMedlemskapAccessData()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step3',
    })
  }, [])

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.login)
  }

  const onPrevious = (): void => {
    navigate(paths.samtykke)
  }

  const onNext = (): void => {
    navigate(paths.afp)
  }

  return (
    <>
      <React.Suspense
        fallback={
          <Loader
            data-testid="loader"
            size="3xlarge"
            title={intl.formatMessage({ id: 'pageframework.loading' })}
          />
        }
      >
        <Await resolve={loaderData.getTpoMedlemskapQuery}>
          {(getTpoMedlemskapQuery: TpoMedlemskapQuery) => {
            return getTpoMedlemskapQuery.isError ? (
              <Card hasLargePadding hasMargin>
                <Card.Content
                  onPrimaryButtonClick={onNext}
                  onSecondaryButtonClick={onPrevious}
                  onTertiaryButtonClick={onCancel}
                  text={{
                    header: 'stegvisning.offentligtp.error.title',
                    ingress: 'stegvisning.offentligtp.error.ingress',
                    primaryButton: 'stegvisning.neste',
                    secondaryButton: 'stegvisning.tilbake',
                    tertiaryButton: 'stegvisning.avbryt',
                  }}
                />
              </Card>
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
      </React.Suspense>
    </>
  )
}
