import { useNavigate } from 'react-router-dom'

import { BodyShort, Button, Heading } from '@navikt/ds-react'

import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'

import styles from './TilbakeEllerAvslutt.module.scss'

export function TilbakeEllerAvslutt() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onResetClick = (): void => {
    dispatch(userInputActions.flush())
    navigate('/stegvisning/0')
  }

  const onCancelClick = (): void => {
    window.location.href = 'http://www.nav.no/pensjon'
  }

  return (
    <section className={styles.section}>
      <Heading size="medium" level="2" spacing>
        Vil du starte en ny beregning?
      </Heading>
      <BodyShort>
        Hvis du starter en ny beregning eller går ut av siden vil beregningen
        over slettes.
      </BodyShort>
      <Button className={styles.button} onClick={onResetClick}>
        Start ny beregning
      </Button>
      <Button
        variant="tertiary"
        className={styles.button}
        onClick={onCancelClick}
      >
        Avslutt og gå til Din Pensjon
      </Button>
    </section>
  )
}
