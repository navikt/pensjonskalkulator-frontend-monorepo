/* eslint-disable react/prop-types */
import { FormattedMessage } from 'react-intl'
import { Fragment } from 'react/jsx-runtime'

import { Alert, BodyLong, Heading } from '@navikt/ds-react'

import { ALERT_VIST } from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'
import { useIsMobile } from '@/utils/useIsMobile'

import { usePrivatePensjonsAvtalerAlertList } from '../hooks'
import { PrivatePensjonsavtalerProps } from '../utils'
import { PrivatePensjonsavtalerDesktop, PrivatePensjonsavtalerMobile } from './'

import styles from './PrivatePensjonsavtaler.module.scss'

export const PrivatePensjonsavtaler: React.FC<PrivatePensjonsavtalerProps> = ({
  isPartialResponse,
  isError,
  isSuccess,
  headingLevel,
  privatePensjonsavtaler,
}) => {
  const isMobile = useIsMobile()
  const alertsList = usePrivatePensjonsAvtalerAlertList({
    isPartialResponse,
    isError,
    isSuccess,
    headingLevel,
    privatePensjonsavtaler,
  })

  // TODO PEK-812 Bør vi ha en håndtering av loading?
  return (
    <>
      {alertsList.map(
        (alert: {
          alertTextId: string
          variant: 'info' | 'warning'
          logText?: string
          headingId?: string
          className?: string
        }) => {
          if (alert.logText) {
            logger(ALERT_VIST, {
              tekst: alert.logText,
              variant: alert.variant,
            })
          }

          return (
            <Fragment key={alert.alertTextId}>
              {alert.headingId && (
                <Heading level={headingLevel} size="small" spacing>
                  <FormattedMessage id={alert.headingId} />
                </Heading>
              )}

              <Alert
                inline
                variant={alert.variant}
                className={alert.className ?? styles.alert__margin}
              >
                <FormattedMessage id={alert.alertTextId} />
              </Alert>
            </Fragment>
          )
        }
      )}

      {isSuccess &&
        privatePensjonsavtaler &&
        privatePensjonsavtaler.length > 0 && (
          <div data-testid="private-pensjonsavtaler">
            {isMobile ? (
              <PrivatePensjonsavtalerMobile
                headingLevel={headingLevel}
                pensjonsavtaler={privatePensjonsavtaler}
              />
            ) : (
              <PrivatePensjonsavtalerDesktop
                headingLevel={headingLevel}
                pensjonsavtaler={privatePensjonsavtaler}
              />
            )}
          </div>
        )}

      <BodyLong className={styles.paragraph} size="small">
        <FormattedMessage
          id="pensjonsavtaler.private.ingress.norsk_pensjon"
          values={{
            ...getFormatMessageValues(),
          }}
        />
      </BodyLong>
    </>
  )
}
