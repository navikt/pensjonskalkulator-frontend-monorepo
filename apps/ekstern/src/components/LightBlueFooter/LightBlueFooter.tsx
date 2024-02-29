import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Button } from '@navikt/ds-react'

import { paths } from '@/router/constants'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { wrapLogger } from '@/utils/logging'

import styles from './LightBlueFooter.module.scss'

export function LightBlueFooter() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onResetClick = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.start)
  }

  return (
    <section className={styles.section}>
      <div className={styles.innerwrapper}>
        <Button
          variant="tertiary"
          className={styles.button}
          onClick={wrapLogger('button klikk', { tekst: 'Tilbake til start' })(
            onResetClick
          )}
        >
          <FormattedMessage id="stegvisning.tilbake_start" />
        </Button>
      </div>
    </section>
  )
}
