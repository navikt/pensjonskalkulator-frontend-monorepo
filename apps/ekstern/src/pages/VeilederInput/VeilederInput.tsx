import React from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router'

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
import { API_BASEURL } from '@/paths'
import { BASE_PATH } from '@/router/constants'
import { routes } from '@/router/routes'
import {
  apiSlice,
  useGetAnsattIdQuery,
  useGetPersonQuery,
} from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectVeilederBorgerEncryptedFnr,
  selectVeilederBorgerFnr,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { isFoedtFoer1963 } from '@/utils/alder'

import { AlertDelB } from './AlertDelB'
import { VeilederInputRequestError } from './VeilederInputRequestError'

import styles from './VeilederInput.module.scss'

const router = createBrowserRouter(routes, {
  basename: `${BASE_PATH}/veileder`,
})

export const VeilederInput = () => {
  const dispatch = useAppDispatch()
  const veilederBorgerFnr = useAppSelector(selectVeilederBorgerFnr)
  const veilederBorgerEncryptedFnr = useAppSelector(
    selectVeilederBorgerEncryptedFnr
  )

  const { data: ansatt } = useGetAnsattIdQuery()

  const {
    isSuccess: personSuccess,
    isFetching: personLoading,
    error: personError,
    data: personData,
  } = useGetPersonQuery(undefined, {
    skip: !veilederBorgerFnr || !veilederBorgerEncryptedFnr,
  })

  const showDelbWarning = React.useMemo(
    () =>
      personData?.foedselsdato &&
      isFoedtFoer1963(personData?.foedselsdato) &&
      veilederBorgerFnr,
    [veilederBorgerFnr, personData?.foedselsdato]
  )

  const [encryptedRequestLoading, setEncryptedRequestLoading] = React.useState<
    'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'
  >('IDLE')

  const isLoading = React.useMemo(
    () => personLoading || encryptedRequestLoading === 'LOADING',
    [personLoading, encryptedRequestLoading]
  )

  const hasTimedOut = React.useMemo(() => {
    const queryParams = new URLSearchParams(window.location.search)
    return queryParams.has('timeout')
  }, [])

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

  const onTitleClick = () => {
    window.location.href = `${BASE_PATH}/veileder`
  }

  const encryptFnr = (fnr: string) => {
    setEncryptedRequestLoading('LOADING')
    return fetch(`${API_BASEURL}/v1/encrypt`, {
      method: 'POST',
      body: fnr,
    })
      .then((res) => {
        setEncryptedRequestLoading('SUCCESS')
        return res.text()
      })
      .catch(() => {
        setEncryptedRequestLoading('ERROR')
        console.error('Kunne ikke hente kryptert fnr.')
      })
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const nyFnr = data.get(`veilederBorgerFnr`)

    if (nyFnr) {
      encryptFnr(nyFnr as string).then((encryptedFnr) => {
        if (encryptedFnr) {
          dispatch(
            userInputActions.setVeilederBorgerFnr({
              fnr: nyFnr as string,
              encryptedFnr,
            })
          )
        }
        dispatch(apiSlice.util.invalidateTags(['Person']))
      })
    }
  }

  if ((!personSuccess && !veilederBorgerFnr) || personError || isLoading) {
    return (
      <div data-testid="veileder-uten-borger">
        <InternalHeader>
          <InternalHeader.Title>Pensjonskalkulator</InternalHeader.Title>
          <Spacer />
          <InternalHeader.User name={ansatt?.id ?? ''} />
        </InternalHeader>

        <FrameComponent>
          <Card>
            <Heading level="2" size="medium" spacing>
              Veiledertilgang
            </Heading>
            <VStack gap="6">
              {hasTimedOut && (
                <Alert variant="warning" data-testid="inaktiv-alert">
                  Du var for lenge inaktiv og sesjonen for bruker har derfor
                  løpt ut.
                  <br /> Logg inn på bruker på nytt.
                </Alert>
              )}
              {encryptedRequestLoading === 'ERROR' && (
                <Alert variant="error" data-testid="error-alert">
                  Feil ved kryptering av fødselsnummer
                </Alert>
              )}
              <VeilederInputRequestError personError={personError} />
              <BodyLong>
                Logg inn i pensjonskalkulator på vegne av bruker.
              </BodyLong>
              <form onSubmit={onSubmit} className={styles.form}>
                <VStack gap="6">
                  <TextField
                    data-testid="borger-fnr-input"
                    label="Fødselsnummer"
                    name="veilederBorgerFnr"
                    description="11 siffer"
                  />
                  <HStack gap="2">
                    <Button
                      type="submit"
                      data-testid="veileder-submit"
                      loading={personLoading}
                    >
                      Logg inn
                    </Button>
                  </HStack>
                </VStack>
              </form>
              <BodyLong>
                Denne pensjonskalkulatoren kan foreløpig kun brukes til
                veiledning.
              </BodyLong>
            </VStack>
          </Card>
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
        {veilederBorgerFnr && <BorgerInformasjon fnr={veilederBorgerFnr} />}
        <div className={styles.alert}>
          {showDelbWarning && <AlertDelB fnr={veilederBorgerFnr!} />}
        </div>
        <RouterProvider router={router} />
      </div>
    )
  }
}

if (window.Cypress) {
  window.router = router
}
