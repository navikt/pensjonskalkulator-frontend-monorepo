import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Button } from '@navikt/ds-react'

import { paths } from '@/router'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { wrapLogger } from '@/utils/logging'

import styles from './TilbakeEllerAvslutt.module.scss'

export function TilbakeEllerAvslutt() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onResetClick = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.start)
  }

  const onCancelClick = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.login)
  }

  return (
    <section className={styles.section}>
      <div className={styles.innerwrapper}>
        <Button
          variant="secondary"
          className={styles.button}
          onClick={wrapLogger('button klikk', { tekst: 'Tilbake til start' })(
            onResetClick
          )}
        >
          <FormattedMessage id="stegvisning.tilbake_start" />
        </Button>
        <Button
          variant="tertiary"
          className={`${styles.button} ${styles.button__avbryt}`}
          onClick={wrapLogger('button klikk', { tekst: 'Avbryt' })(
            onCancelClick
          )}
        >
          <FormattedMessage id="stegvisning.avbryt" />
        </Button>
      </div>
    </section>
  )
}
