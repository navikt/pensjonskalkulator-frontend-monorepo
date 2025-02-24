import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Alert, BodyLong, Heading, HeadingProps } from '@navikt/ds-react'

import { getFormatMessageValues } from '@/utils/translations'
import { useIsMobile } from '@/utils/useIsMobile'

import styles from './PrivatePensjonsavtaler.module.scss'

import { PrivatePensjonsavtalerMobile, PrivatePensjonsavtalerDesktop } from './'

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

  // TODO PEK-812 Bør vi ha en håndtering av loading?
  return (
    <>
      {
        // Når brukeren har samtykket og har ingen private pensjonsavtaler
        isSuccess &&
          !isPartialResponse &&
          privatePensjonsavtaler?.length === 0 && (
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
        (isError ||
          (isPartialResponse && privatePensjonsavtaler?.length === 0)) && (
          <>
            <Heading level={headingLevel} size="small" spacing>
              <FormattedMessage id="pensjonsavtaler.private.title.ingen" />
            </Heading>
            <Alert inline variant="warning">
              <FormattedMessage
                id={'pensjonsavtaler.private.ingress.error.pensjonsavtaler'}
              />
            </Alert>
          </>
        )
      }

      {
        // Når private pensjonsavtaler er partial med noen avtaler
        isSuccess &&
          isPartialResponse &&
          privatePensjonsavtaler &&
          privatePensjonsavtaler?.length > 0 && (
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
