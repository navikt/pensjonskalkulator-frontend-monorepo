import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router'

import { BodyLong, Button, Heading, HeadingProps } from '@navikt/ds-react'

import { paths } from '@/router/constants'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { wrapLogger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './SavnerDuNoe.module.scss'

interface Props {
  headingLevel: HeadingProps['level']
  isEndring: boolean
  showAvansert?: boolean
}

export const SavnerDuNoe = ({
  headingLevel,
  isEndring,
  showAvansert,
}: Props) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onClick = (): void => {
    dispatch(userInputActions.flushCurrentSimulation())
    navigate(paths.beregningAvansert)
  }

  return (
    <section className={styles.section}>
      <Heading level={headingLevel} size="medium" className={styles.heading}>
        <FormattedMessage
          id={isEndring ? 'savnerdunoe.title.endring' : 'savnerdunoe.title'}
        />
      </Heading>

      {showAvansert && !isEndring && (
        <>
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
        </>
      )}

      {isEndring && (
        <BodyLong>
          <FormattedMessage
            id="savnerdunoe.body.endring"
            values={{
              ...getFormatMessageValues(),
            }}
          />
        </BodyLong>
      )}
    </section>
  )
}
