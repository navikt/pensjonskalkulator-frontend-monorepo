import React from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import {
  Alert,
  BodyLong,
  BodyShort,
  Box,
  Button,
  CopyButton,
  HStack,
  Heading,
  InternalHeader,
  Loader,
  Spacer,
  TextField,
  VStack,
} from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { FrameComponent } from '@/components/common/PageFramework/FrameComponent'
import { BASE_PATH } from '@/router/constants'
import { routes } from '@/router/routes'
import { useGetPersonQuery } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { veilederBorgerFnrSelector } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

interface IBorgerInformasjonProps {
  fnr: string
}

const BorgerInformasjon: React.FC<IBorgerInformasjonProps> = ({ fnr }) => {
  const { data: person, isFetching: isPersonFetching } = useGetPersonQuery()

  const onNullstillClick = () => {
    window.location.href = `${BASE_PATH}/veileder`
  }

  return (
    <Box
      background="bg-default"
      borderWidth="0 0 2 0"
      borderColor="border-divider"
    >
      <HStack align="center" gap="2" style={{ padding: '16px 24px' }}>
        {isPersonFetching ? (
          <Loader />
        ) : (
          <BodyShort>{`${person?.fornavn}`}</BodyShort>
        )}
        <span aria-hidden="true">/</span>
        <HStack align="center" gap="1">
          {fnr} <CopyButton size="small" copyText={fnr} />
        </HStack>
        <Spacer />
        <div>
          <Button onClick={onNullstillClick} variant="secondary" size="small">
            Nullstill bruker
          </Button>
        </div>
      </HStack>
    </Box>
  )
}

export const VeilederInput = () => {
  const dispatch = useAppDispatch()
  const veilederBorgerFnr = useAppSelector(veilederBorgerFnrSelector)

  const hasTimedOut = React.useMemo(() => {
    const queryParams = new URLSearchParams(window.location.search)
    return queryParams.has('timeout')
  }, [])

  const onTitleClick = () => {
    window.location.href = `${BASE_PATH}/veileder`
  }

  // TODO: Reset timeout når man gjør noe
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
  }

  const router = createBrowserRouter(routes, {
    basename: `${BASE_PATH}/veileder`,
  })

  if (window.Cypress) {
    window.router = router
  }

  if (!veilederBorgerFnr) {
    return (
      <div>
        <InternalHeader>
          <InternalHeader.Title>Pensjonskalkulator</InternalHeader.Title>
          <Spacer />
          <InternalHeader.User name="SBHIDENT" />
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
                <BodyLong>
                  Logg inn i enkel pensjonskalkulator på vegne av bruker.
                </BodyLong>
                <form onSubmit={onSubmit} style={{ maxWidth: '16em' }}>
                  <VStack gap="2">
                    <TextField
                      label="Fødselsnummer"
                      name="veilderBorgerFnr"
                      description="11 siffer"
                    ></TextField>
                    <HStack gap="2">
                      <Button type="submit">Logg inn</Button>
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
      <div>
        <InternalHeader>
          <InternalHeader.Title onClick={onTitleClick}>
            Pensjonskalkulator
          </InternalHeader.Title>
          <Spacer />
          <InternalHeader.User name="SBHIDENT" />
        </InternalHeader>
        <BorgerInformasjon fnr={veilederBorgerFnr} />

        <RouterProvider router={router} />
      </div>
    )
  }
}
