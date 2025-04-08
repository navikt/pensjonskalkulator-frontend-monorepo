import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { Alert } from '@navikt/ds-react'

interface Props {
  personError: FetchBaseQueryError | SerializedError | undefined
}

export const VeilederInputRequestError = ({ personError }: Props) => {
  if (!personError) return null

  if ('status' in personError) {
    switch (personError.status) {
      case 403:
        return (
          <Alert variant="warning" data-testid="alert-ikke-tilgang">
            Du har ikke tilgang til brukeren eller pensjonskalkulatoren. Hvis du
            mener du skal ha tilgang, kontakt din lokale IT-ansvarlig.
          </Alert>
        )
      case 404:
        return (
          <Alert variant="warning" data-testid="alert-ikke-gyldig">
            Fødselsnummeret er ikke gyldig.
          </Alert>
        )
      default:
        return (
          <Alert variant="warning" data-testid="alert-annet">
            Feil ved henting av person.
          </Alert>
        )
    }
  } else {
    return (
      <Alert variant="warning" data-testid="alert-annet">
        Feil ved henting av person.
      </Alert>
    )
  }
}
