import { useNavigate } from 'react-router-dom'

import { Button } from '@navikt/ds-react'

import { externalsUrls, paths } from '@/routes'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'

import styles from './TilbakeEllerAvslutt.module.scss'

export function TilbakeEllerAvslutt() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onResetClick = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.start)
  }

  const onCancelClick = (): void => {
    window.location.href = externalsUrls.dinPensjon
  }

  return (
    <section className={styles.section}>
      <div className={styles.innerwrapper}>
        <Button
          variant="secondary"
          className={styles.button}
          onClick={onResetClick}
        >
          Tilbake til start
        </Button>
        <Button
          variant="tertiary"
          className={`${styles.button} ${styles.button__avbryt}`}
          onClick={onCancelClick}
        >
          Avbryt
        </Button>
      </div>
    </section>
  )
}
