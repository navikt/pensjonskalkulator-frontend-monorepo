import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'

import { Alert, BodyLong, Heading, HeadingProps } from '@navikt/ds-react'

import { ALERT_VIST } from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'
import { useIsMobile } from '@/utils/useIsMobile'

import { PrivatePensjonsavtalerDesktop, PrivatePensjonsavtalerMobile } from './'

import styles from './PrivatePensjonsavtaler.module.scss'

interface PrivatePensjonsavtalerProps {
  isPartialResponse: boolean
  isError?: boolean
  isSuccess: boolean
  headingLevel: HeadingProps['level']
  privatePensjonsavtaler?: Pensjonsavtale[]
}

export const PrivatePensjonsavtaler: React.FC<PrivatePensjonsavtalerProps> = ({
  isPartialResponse,
  isError,
  isSuccess,
  headingLevel,
  privatePensjonsavtaler,
}) => {
  const isMobile = useIsMobile()
  const errorOrNoPrivatePensjonsavtaler =
    isError || (isPartialResponse && privatePensjonsavtaler?.length === 0)

  const noPrivatePensjonsavtaler =
    isSuccess && !isPartialResponse && privatePensjonsavtaler?.length === 0

  const partialPrivatePensjonsavtaler =
    isSuccess &&
    isPartialResponse &&
    privatePensjonsavtaler &&
    privatePensjonsavtaler?.length > 0

  useEffect(() => {
    if (errorOrNoPrivatePensjonsavtaler) {
      logger(ALERT_VIST, {
        tekst: 'Klarte ikke å hente private pensjonsavtaler',
        variant: 'warning',
      })
    }

    if (partialPrivatePensjonsavtaler) {
      logger(ALERT_VIST, {
        tekst: 'Klarte ikke å hente alle private pensjonsavtaler',
        variant: 'warning',
      })
    }

    if (noPrivatePensjonsavtaler) {
      logger(ALERT_VIST, {
        tekst: 'Fant ingen private pensjonsavtaler',
        variant: 'info',
      })
    }
  }, [
    errorOrNoPrivatePensjonsavtaler,
    noPrivatePensjonsavtaler,
    partialPrivatePensjonsavtaler,
  ])

  // TODO PEK-812 Bør vi ha en håndtering av loading?
  return (
    <>
      {
        // Når brukeren har samtykket og har ingen private pensjonsavtaler
        noPrivatePensjonsavtaler && (
          <>
            <Heading level={headingLevel} size="small" spacing>
              <FormattedMessage id="pensjonsavtaler.private.title.ingen" />
            </Heading>

            <Alert inline variant="info">
              <FormattedMessage id="pensjonsavtaler.ingress.ingen" />
            </Alert>
          </>
        )
      }

      {
        // Når private pensjonsavtaler feiler helt eller er partial med 0 avtaler
        errorOrNoPrivatePensjonsavtaler && (
          <>
            <Heading level={headingLevel} size="small" spacing>
              <FormattedMessage id="pensjonsavtaler.private.title.ingen" />
            </Heading>

            <Alert inline variant="warning">
              <FormattedMessage id="pensjonsavtaler.private.ingress.error.pensjonsavtaler" />
            </Alert>
          </>
        )
      }

      {
        // Når private pensjonsavtaler er partial med noen avtaler
        partialPrivatePensjonsavtaler && (
          <Alert inline variant="warning" className={styles.alert__margin}>
            <FormattedMessage id="pensjonsavtaler.private.ingress.error.pensjonsavtaler.partial" />
          </Alert>
        )
      }

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
