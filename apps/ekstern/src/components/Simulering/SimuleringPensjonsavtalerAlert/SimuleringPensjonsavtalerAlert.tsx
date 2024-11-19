import React from 'react'
import { FormattedMessage } from 'react-intl'

import { InformationSquareFillIcon } from '@navikt/aksel-icons'
import { Alert, Link } from '@navikt/ds-react'

import { BeregningContext } from '@/pages/Beregning/context'

import styles from './SimuleringPensjonsavtalerAlert.module.scss'

interface Props {
  variant?: 'info' | 'warning'
  text?: string
  showInfo: boolean
}

export const SimuleringPensjonsavtalerAlert: React.FC<Props> = ({
  variant,
  text,
  showInfo,
}) => {
  const { pensjonsavtalerShowMoreRef } = React.useContext(BeregningContext)
  const handlePensjonsavtalerLinkClick: React.MouseEventHandler<
    HTMLAnchorElement
  > = (e): void => {
    e.preventDefault()
    if (pensjonsavtalerShowMoreRef) {
      pensjonsavtalerShowMoreRef?.current?.focus()
    } else {
      const pensjonsavtalerHeader = document.getElementById(
        'pensjonsavtaler-heading'
      )
      if (pensjonsavtalerHeader) {
        window.scrollTo({
          top: pensjonsavtalerHeader.offsetTop - 15,
          behavior: 'smooth',
        })
      }
    }
  }

  if (variant === undefined && !showInfo) {
    return null
  }

  return (
    <>
      {variant && (
        <Alert
          variant={variant}
          data-testid="pensjonsavtaler-alert"
          className={styles.alert}
        >
          <FormattedMessage
            id={text}
            values={{
              scrollTo: (chunk) => (
                <Link
                  href="#"
                  data-testid="pensjonsavtaler-alert-link"
                  onClick={handlePensjonsavtalerLinkClick}
                >
                  {chunk}
                </Link>
              ),
            }}
          />
        </Alert>
      )}
      {showInfo && (
        <div
          aria-live="assertive"
          data-testid="pensjonsavtaler-info"
          className={styles.info}
        >
          <InformationSquareFillIcon
            className={styles.infoIcon}
            fontSize="1.5rem"
            aria-hidden
          />
          <p className={styles.infoText}>
            <FormattedMessage
              id="beregning.pensjonsavtaler.info"
              values={{
                scrollTo: (chunk) => (
                  <Link
                    href="#"
                    data-testid="pensjonsavtaler-info-link"
                    onClick={handlePensjonsavtalerLinkClick}
                  >
                    {chunk}
                  </Link>
                ),
              }}
            />
          </p>
        </div>
      )}
    </>
  )
}
