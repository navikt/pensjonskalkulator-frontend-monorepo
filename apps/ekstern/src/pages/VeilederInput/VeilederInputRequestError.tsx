import { SanityAlert } from '@pensjonskalkulator-frontend-monorepo/sanity/SanityAlert'
import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

interface Props {
  personError: FetchBaseQueryError | SerializedError | undefined
}

export const VeilederInputRequestError = ({ personError }: Props) => {
  if (!personError) return null

  const status = 'status' in personError ? personError.status : undefined
  const sanityId =
    status === 403
      ? 'veileder.ingen-tilgang'
      : status === 404
        ? 'veileder.ugyldig-foedselsnummer'
        : 'veileder.alle-andre-feil'

  return <SanityAlert id={sanityId} role="alert" />
}
