/* c8 ignore next 23 -- TODO: Legg til test */
import { useNavigate } from 'react-router-dom'

import { Button } from '@navikt/ds-react'

import { paths } from '@/router'

export function Step1() {
  const navigate = useNavigate()
  const onNext = (): void => {
    navigate(paths.samtykke)
  }
  const onPrev = (): void => {
    navigate(paths.start)
  }
  return (
    <div>
      <h1>Utenlandsopphold</h1>

      <Button onClick={onNext}>Neste</Button>
      <Button onClick={onPrev}>Tilbake</Button>
    </div>
  )
}
