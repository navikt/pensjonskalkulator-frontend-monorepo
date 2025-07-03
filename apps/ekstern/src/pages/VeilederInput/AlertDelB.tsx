import React from 'react'

import { Alert, Button, HStack } from '@navikt/ds-react'

import { externalUrls } from '@/router/constants'

interface IAlertDelBProps {
  fnr: string
}
export const AlertDelB: React.FC<IAlertDelBProps> = ({ fnr }) => {
  const [showAlert, setShowAlert] = React.useState(true)

  if (!showAlert) {
    return null
  }

  return (
    <form
      action={externalUrls.detaljertKalkulator}
      method="POST"
      data-testid="alert-del-b"
    >
      <input type="hidden" name="fnr" value={fnr} />
      <Alert variant="warning" onClose={() => setShowAlert(false)} closeButton>
        <HStack>
          <div>
            Bruker er født før 1963. Gå til detaljert pensjonskalkulator (Del B)
            for å beregne offentlig tjenestepensjon fra Statens pensjonskasse.
          </div>
          <Button size="small" variant="secondary-neutral" type="submit">
            Gå til detaljert pensjonskalkulator
          </Button>
        </HStack>
      </Alert>
    </form>
  )
}
