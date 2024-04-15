import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import { Button, InternalHeader, Spacer, TextField } from '@navikt/ds-react'

import { BASE_PATH } from '@/router/constants'
import { routes } from '@/router/routes'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { veilederBorgerFnrSelector } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export const VeilederInput = () => {
  const dispatch = useAppDispatch()
  const veilederBorgerFnr = useAppSelector(veilederBorgerFnrSelector)
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
        Her kommer veilederene
        <form onSubmit={onSubmit}>
          <TextField label="FNR" name="veilderBorgerFnr"></TextField>
          <Button type="submit">Søk</Button>
        </form>
      </div>
    )
  } else {
    return (
      <div>
        <InternalHeader>
          <InternalHeader.Title>Pensjonskalkulator</InternalHeader.Title>
          <Spacer />
          <InternalHeader.User name="SBHIDENT" />
        </InternalHeader>

        <RouterProvider router={router} />
      </div>
    )
  }
}
