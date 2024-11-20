import React from 'react'
import { FormattedMessage } from 'react-intl'

import { InformationSquareFillIcon } from '@navikt/aksel-icons'
import { Alert, Link } from '@navikt/ds-react'

import { BeregningContext } from '@/pages/Beregning/context'

import styles from './SimuleringPensjonsavtalerAlert.module.scss'

interface Props {
  variant?: 'alert-info' | 'alert-warning' | 'info'
  text?: string
}

export const SimuleringPensjonsavtalerAlert: React.FC<Props> = ({
  variant,
  text,
}) => {
  const { pensjonsavtalerShowMoreRef } = React.useContext(BeregningContext)
  const handlePensjonsavtalerLinkClick: React.MouseEventHandler<
    HTMLAnchorElement
  > = (e): void => {
    e.preventDefault()
    if (pensjonsavtalerShowMoreRef?.current) {
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

  if (variant === undefined) {
    return null
  }

  return (
    <>
      {(variant === 'alert-info' || variant === 'alert-warning') && (
        <Alert
          variant={variant?.replace('alert-', '') as 'info' | 'warning'}
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
      {variant === 'info' && (
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
              id={text}
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
