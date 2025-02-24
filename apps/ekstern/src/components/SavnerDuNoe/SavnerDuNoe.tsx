import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router'

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
  isEndring: boolean
  showAvansert?: boolean
}) {
  const { headingLevel, isEndring, showAvansert } = props
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onClick = (): void => {
    dispatch(userInputActions.flushCurrentSimulationUtenomUtenlandsperioder())
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
          id={isEndring ? 'savnerdunoe.body.endring' : 'savnerdunoe.body'}
          values={{
            ...getFormatMessageValues(),
          }}
        />
      </BodyLong>
    </section>
  )
}
