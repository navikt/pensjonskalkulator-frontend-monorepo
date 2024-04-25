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
import { veilederBorgerFnrSelector } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

import { VeilederInputRequestError } from './VeilederInputRequestError'

const router = createBrowserRouter(routes, {
  basename: location.pathname,
})

export const VeilederInput = () => {
  const dispatch = useAppDispatch()
  const veilederBorgerFnr = useAppSelector(veilederBorgerFnrSelector)

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
        window.location.href = `${BASE_PATH}/veileder?timeout`
      },
      60 * 60 * 1000
    )
    return () => clearTimeout(timer)
  }, [])

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nyFnr = event.currentTarget.veilderBorgerFnr.value
    dispatch(userInputActions.setVeilederBorgerFnr(nyFnr))
    dispatch(apiSlice.util.invalidateTags(['Person']))
  }

  console.log('personError', personError)

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
                  <Alert variant="warning">
                    Du var for lenge inaktiv og sesjonen for bruker har derfor
                    løpt ut.
                    <br /> Logg inn på bruker på nytt.
                  </Alert>
                )}
                <VeilederInputRequestError personError={personError} />
                <BodyLong>
                  Logg inn i enkel pensjonskalkulator på vegne av bruker.
                </BodyLong>
                <form onSubmit={onSubmit} style={{ maxWidth: '16em' }}>
                  <VStack gap="2">
                    <TextField
                      data-testid="borger-fnr-input"
                      label="Fødselsnummer"
                      name="veilderBorgerFnr"
                      description="11 siffer"
                    ></TextField>
                    <HStack gap="2">
                      <Button type="submit" loading={personLoading}>
                        Logg inn
                      </Button>
                      <Button type="reset" variant="tertiary">
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
