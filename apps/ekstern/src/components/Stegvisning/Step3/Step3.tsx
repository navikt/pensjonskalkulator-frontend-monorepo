import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { BodyLong, Button, Heading } from '@navikt/ds-react'

import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'

import styles from './Step3.module.scss'

export function Step3() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const onCancelClick = (): void => {
    dispatch(userInputActions.flush())
    navigate('/')
  }

  const onPreviousClick = (): void => {
    navigate('/stegvisning/2')
  }

  const onNextClick = (): void => {
    navigate('/beregning')
  }

  return (
    <section className={styles.section}>
      <Heading size="large" level="2" spacing>
        <FormattedMessage id="stegvisning.steg3.title" />
      </Heading>
      <BodyLong spacing>
        <FormattedMessage id="stegvisning.steg3.ingress_1" />
      </BodyLong>
      <BodyLong>
        <FormattedMessage id="stegvisning.steg3.ingress_2" />
      </BodyLong>

      <Button className={styles.button} onClick={onNextClick}>
        <FormattedMessage id="stegvisning.neste" />
      </Button>
      <Button
        className={styles.button}
        variant="secondary"
        onClick={onPreviousClick}
      >
        <FormattedMessage id="stegvisning.tilbake" />
      </Button>
      <Button variant="tertiary" onClick={onCancelClick}>
        <FormattedMessage id="stegvisning.avbryt" />
      </Button>
    </section>
  )
}
