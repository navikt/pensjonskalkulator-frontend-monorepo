// import { useIntl } from 'react-intl'
import { Link, useNavigate } from 'react-router-dom'

import { Button, Heading } from '@navikt/ds-react'

import { Card } from '@/components/Card'

export function Step1() {
  const navigate = useNavigate()

  const onPreviousClick = (): void => {
    navigate('/stegvisning/0')
  }

  const onNextClick = (): void => {
    navigate('/beregning')
  }

  return (
    <Card>
      <Heading size="large" level="2" spacing>
        STEP 1
      </Heading>

      <Button onClick={onNextClick}>Gå til Beregningen</Button>
      <Button variant="tertiary" onClick={onPreviousClick}>
        Tilbake
      </Button>

      <Link to="/beregning"></Link>
    </Card>
  )
}
