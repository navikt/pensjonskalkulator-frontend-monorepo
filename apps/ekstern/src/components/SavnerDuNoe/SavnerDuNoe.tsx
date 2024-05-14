import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Button } from '@navikt/ds-react'
import { BodyLong, Heading, HeadingProps } from '@navikt/ds-react'

import { paths } from '@/router/constants'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { wrapLogger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './SavnerDuNoe.module.scss'

export function SavnerDuNoe(props: {
  headingLevel: HeadingProps['level']
  showAvansert?: boolean
}) {
  const { headingLevel, showAvansert } = props
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onClick = (): void => {
    dispatch(userInputActions.flushCurrentSimulation())
    navigate(paths.beregningAvansert)
  }

  return (
    <section className={styles.section}>
      <Heading level={headingLevel} size="medium" spacing>
        <FormattedMessage id="savnerdunoe.title" />
      </Heading>
      {showAvansert && (
        <div className={styles.paragraph}>
          <BodyLong size="large">
            <FormattedMessage id="savnerdunoe.ingress" />
          </BodyLong>
          <Button
            variant="secondary"
            className={styles.button}
            onClick={wrapLogger('button klikk', {
              tekst: 'Savner du noe?',
            })(onClick)}
          >
            <FormattedMessage id="savnerdunoe.button" />
          </Button>
        </div>
      )}
      <BodyLong>
        <FormattedMessage
          id="savnerdunoe.body"
          values={{
            ...getFormatMessageValues(intl),
          }}
        />
      </BodyLong>
    </section>
  )
}
