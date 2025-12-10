import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Alert, Link } from '@navikt/ds-react'

import { useAppSelector } from '@/state/hooks'
import { selectFoedselsdato } from '@/state/userInput/selectors'
import { isAlderOver62 } from '@/utils/alder'
import { ALERT_VIST } from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'

import styles from './SimuleringAfpOffentligAlert.module.scss'

interface Props {
  harSamtykketOffentligAFP: boolean | null
  isAfpOffentligLivsvarigSuccess: boolean
  loependeLivsvarigAfpOffentlig?: AfpOffentligLivsvarig
}

export const SimuleringAfpOffentligAlert: React.FC<Props> = ({
  harSamtykketOffentligAFP,
  isAfpOffentligLivsvarigSuccess,
  loependeLivsvarigAfpOffentlig,
}) => {
  const intl = useIntl()
  const foedselsdato = useAppSelector(selectFoedselsdato)

  const handleAfpOffentligLinkClick: React.MouseEventHandler<
    HTMLAnchorElement
  > = (e): void => {
    e.preventDefault()
    const afpOffentligHeader = document.getElementById('afp-offentlig-heading')
    if (afpOffentligHeader) {
      // Get absolute position from top of document
      let element = afpOffentligHeader
      let offsetTop = 0

      while (element) {
        offsetTop += element.offsetTop
        element = element.offsetParent as HTMLElement
      }

      window.scrollTo({
        top: offsetTop - 15,
        behavior: 'smooth',
      })
    }
  }

  // Viser ikke alert hvis kallet aldri ble forsøkt (query ble skippet)
  if (
    !harSamtykketOffentligAFP ||
    !foedselsdato ||
    !isAlderOver62(foedselsdato)
  ) {
    return null
  }

  // Viser ikke alert hvis bruker ikke har vedtak om afp offentlig
  if (
    isAfpOffentligLivsvarigSuccess &&
    loependeLivsvarigAfpOffentlig?.afpStatus === false
  ) {
    return null
  }

  // Viser ikke alert hvis bruker ikke har løpende livsvarig afp offentlig
  if (
    loependeLivsvarigAfpOffentlig?.afpStatus === null &&
    loependeLivsvarigAfpOffentlig?.maanedligBeloep === null
  ) {
    return null
  }

  // Vellykket kall
  if (
    loependeLivsvarigAfpOffentlig?.afpStatus &&
    loependeLivsvarigAfpOffentlig?.maanedligBeloep &&
    loependeLivsvarigAfpOffentlig?.maanedligBeloep > 0
  ) {
    const alertText = 'beregning.alert.info.afp-offentlig-livsvarig'

    logger(ALERT_VIST, {
      tekst: `AFP Offentlig: ${intl.formatMessage({ id: alertText })}`,
      variant: 'info',
    })

    return (
      <Alert
        variant="info"
        data-testid="alert-afp-offentlig-livsvarig-info"
        data-intl={alertText}
        className={styles.alert}
      >
        <FormattedMessage
          id={alertText}
          values={{
            // eslint-disable-next-line react/no-unstable-nested-components
            scrollTo: (chunk) => (
              <Link
                href="#"
                data-testid="afp-offentlig-alert-link"
                onClick={handleAfpOffentligLinkClick}
              >
                {chunk}
              </Link>
            ),
          }}
        />
      </Alert>
    )
  }

  // Kall feilet
  if (
    !isAfpOffentligLivsvarigSuccess ||
    (loependeLivsvarigAfpOffentlig?.afpStatus &&
      loependeLivsvarigAfpOffentlig?.maanedligBeloep === 0)
  ) {
    const alertText = 'beregning.alert.feil.afp-offentlig-livsvarig'

    logger(ALERT_VIST, {
      tekst: `AFP Offentlig: ${intl.formatMessage({ id: alertText })}`,
      variant: 'warning',
    })

    return (
      <Alert
        variant="warning"
        data-testid="alert-afp-offentlig-livsvarig-failed"
        data-intl={alertText}
        className={styles.alert}
      >
        <FormattedMessage id={alertText} />
      </Alert>
    )
  }

  // Kall var vellykket, men beløp er ikke definert
  if (
    isAfpOffentligLivsvarigSuccess &&
    !loependeLivsvarigAfpOffentlig?.maanedligBeloep
  ) {
    const alertText = 'beregning.alert.success.afp-offentlig-livsvarig'

    logger(ALERT_VIST, {
      tekst: `AFP Offentlig: ${intl.formatMessage({ id: alertText })}`,
      variant: 'warning',
    })

    return (
      <Alert
        variant="warning"
        data-testid="alert-afp-offentlig-livsvarig-success"
        data-intl={alertText}
        className={styles.alert}
      >
        <FormattedMessage id={alertText} />
      </Alert>
    )
  }

  return null
}
