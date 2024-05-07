import { Alert } from '@navikt/ds-react'
import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

interface IValiderInputRequestErrorProps {
  personError: FetchBaseQueryError | SerializedError | undefined
}

export const VeilederInputRequestError: React.FC<
  IValiderInputRequestErrorProps
> = ({ personError }) => {
  if (!personError) return null

  if ('status' in personError) {
    switch (personError.status) {
      case 401:
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
