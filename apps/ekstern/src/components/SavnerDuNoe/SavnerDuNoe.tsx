import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router'

import { LinkCard } from '@navikt/ds-react'

import { BASE_PATH, externalUrls, paths } from '@/router/constants'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { KNAPP_KLIKKET } from '@/utils/loggerConstants'
import { wrapLogger } from '@/utils/logging'

import styles from './SavnerDuNoe.module.scss'

interface Props {
  isEndring: boolean
}

export const SavnerDuNoe = ({ isEndring }: Props) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const href = isEndring
    ? externalUrls.dinPensjonEndreSoeknad
    : `${BASE_PATH}${paths.beregningAvansert}`

  const onClick = (): void => {
    if (isEndring) {
      window.open(href, '_blank', 'noopener')
    } else {
      dispatch(userInputActions.flushCurrentSimulation())
      navigate(paths.beregningAvansert)
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    const isPlainLeftClick =
      e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey

    // * Allow browser to handle middle-click, Cmd+click, etc.
    if (!isPlainLeftClick) return

    e.preventDefault()
    wrapLogger(KNAPP_KLIKKET, {
      tekst: 'Savner du noe?',
    })(onClick)()
  }

  return (
    <section className={styles.section} data-testid="savnerdunoe">
      <LinkCard>
        <LinkCard.Title>
          <LinkCard.Anchor
            href={href}
            onClick={handleClick}
            target={isEndring ? '_blank' : undefined}
            rel={isEndring ? 'noopener' : undefined}
            data-testid="savnerdunoe-title"
          >
            <FormattedMessage
              id={isEndring ? 'savnerdunoe.title.endring' : 'savnerdunoe.title'}
            />
          </LinkCard.Anchor>
        </LinkCard.Title>

        <LinkCard.Description>
          {isEndring ? (
            <FormattedMessage id="savnerdunoe.ingress.endring" />
          ) : (
            <FormattedMessage id="savnerdunoe.ingress" />
          )}
        </LinkCard.Description>
      </LinkCard>
    </section>
  )
}
