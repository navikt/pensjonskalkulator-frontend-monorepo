import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Alert, Link } from '@navikt/ds-react'

import { useAfpOffentligAlerts } from '../temp-hooks'

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

  const afpOffentligAlert = useAfpOffentligAlerts({
    harSamtykketOffentligAFP,
    isAfpOffentligLivsvarigSuccess,
    loependeLivsvarigAfpOffentlig,
  })

  if (afpOffentligAlert?.variant === 'info') {
    return (
      <Alert
        variant="info"
        data-testid="alert-afp-offentlig-livsvarig-info"
        data-intl={afpOffentligAlert.text}
        className={styles.alert}
      >
        <FormattedMessage
          id={afpOffentligAlert.text}
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

  if (afpOffentligAlert?.variant === 'warning') {
    return (
      <Alert
        variant="warning"
        data-testid={`${afpOffentligAlert?.dataTestId ?? 'alert-afp-offentlig-livsvarig-failed'}`}
        data-intl={afpOffentligAlert.text}
        className={styles.alert}
      >
        <FormattedMessage id={afpOffentligAlert.text} />
      </Alert>
    )
  }
  return null
}
