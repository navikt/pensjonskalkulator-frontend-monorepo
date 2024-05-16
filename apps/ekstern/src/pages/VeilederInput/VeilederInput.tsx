import React from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import {
  Alert,
  BodyLong,
  Button,
  HStack,
  Heading,
  InternalHeader,
  Spacer,
  TextField,
  VStack,
} from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { FrameComponent } from '@/components/common/PageFramework/FrameComponent'
import BorgerInformasjon from '@/components/veileder/BorgerInformasjon'
import { BASE_PATH } from '@/router/constants'
import { routes } from '@/router/routes'
import {
  apiSlice,
  useGetAnsattIdQuery,
  useGetPersonQuery,
} from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectVeilederBorgerFnr } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

import { VeilederInputRequestError } from './VeilederInputRequestError'

import styles from './VeilederInput.module.scss'

const router = createBrowserRouter(routes, {
  basename: `${BASE_PATH}/veileder`,
})

export const VeilederInput = () => {
  const dispatch = useAppDispatch()
  const veilederBorgerFnr = useAppSelector(selectVeilederBorgerFnr)

  const { data: ansatt } = useGetAnsattIdQuery()

  const {
    isSuccess: personSuccess,
    isFetching: personLoading,
    error: personError,
  } = useGetPersonQuery(undefined, {
    skip: !veilederBorgerFnr,
  })

  const hasTimedOut = React.useMemo(() => {
    const queryParams = new URLSearchParams(window.location.search)
    return queryParams.has('timeout')
  }, [])

  const onTitleClick = () => {
    window.location.href = `${BASE_PATH}/veileder`
  }

  // Redirect etter 1 time
  React.useEffect(() => {
    if (hasTimedOut) return
    const timer = setTimeout(
      () => {
        console.log('Redirecting to timeout')
        window.location.href = `${BASE_PATH}/veileder?timeout`
      },
      60 * 60 * 1000
    )
    return () => clearTimeout(timer)
  }, [])

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nyFnr = event.currentTarget.veilederBorgerFnr.value
    dispatch(userInputActions.setVeilederBorgerFnr(nyFnr))
    dispatch(apiSlice.util.invalidateTags(['Person']))
  }

  if ((!personSuccess && !veilederBorgerFnr) || personError || personLoading) {
    return (
      <div data-testid="veileder-uten-borger">
        <InternalHeader>
          <InternalHeader.Title>Pensjonskalkulator</InternalHeader.Title>
          <Spacer />
          <InternalHeader.User name={ansatt?.id ?? ''} />
        </InternalHeader>

        <FrameComponent>
          <>
            <Card>
              <Heading level="2" size="medium" spacing>
                Veiledertilgang
              </Heading>
              <VStack gap="4">
                {hasTimedOut && (
                  <Alert variant="warning" data-testid="inaktiv-alert">
                    Du var for lenge inaktiv og sesjonen for bruker har derfor
                    løpt ut.
                    <br /> Logg inn på bruker på nytt.
                  </Alert>
                )}
                <VeilederInputRequestError personError={personError} />
                <BodyLong>
                  Logg inn i pensjonskalkulator på vegne av bruker.
                </BodyLong>
                <form onSubmit={onSubmit} className={styles.form}>
                  <VStack gap="2">
                    <TextField
                      data-testid="borger-fnr-input"
                      label="Fødselsnummer"
                      name="veilederBorgerFnr"
                      description="11 siffer"
                    ></TextField>
                    <HStack gap="2">
                      <Button
                        type="submit"
                        data-testid="veileder-submit"
                        loading={personLoading}
                      >
                        Logg inn
                      </Button>
                      <Button
                        type="reset"
                        data-testid="veileder-reset"
                        variant="tertiary"
                      >
                        Avbryt
                      </Button>
                    </HStack>
                  </VStack>
                </form>
              </VStack>
            </Card>
          </>
        </FrameComponent>
      </div>
    )
  } else {
    return (
      <div data-testid="veileder-med-borger">
        <InternalHeader>
          <InternalHeader.Title onClick={onTitleClick}>
            Pensjonskalkulator
          </InternalHeader.Title>
          <Spacer />
          <InternalHeader.User name={ansatt?.id ?? ''} />
        </InternalHeader>
        <BorgerInformasjon fnr={veilederBorgerFnr!} />

        <RouterProvider router={router} />
      </div>
    )
  }
}

if (window.Cypress) {
  window.router = router
}
