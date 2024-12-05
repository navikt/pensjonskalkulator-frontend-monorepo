import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
} from '@navikt/aksel-icons'
import { BodyLong, HeadingProps } from '@navikt/ds-react'

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
  const intl = useIntl()

  // TODO Bør vi ha en håndtering av loading?
  return (
    <>
      {
        // Når brukeren har samtykket og har ingen private pensjonsavtaler
      }
      {isSuccess &&
        !isPartialResponse &&
        privatePensjonsavtaler?.length === 0 && (
          <div className={`${styles.info}`}>
            <InformationSquareFillIcon
              className={`${styles.infoIcon} ${styles.infoIcon__blue}`}
              fontSize="1.5rem"
              aria-hidden
            />
            <BodyLong className={styles.infoText}>
              <FormattedMessage id="pensjonsavtaler.private.ingress.ingen" />
            </BodyLong>
          </div>
        )}

      {
        // Når private pensjonsavtaler feiler helt eller er partial med 0 avtaler
      }
      {(isError ||
        (isPartialResponse && privatePensjonsavtaler?.length === 0)) && (
        <div className={styles.info}>
          <ExclamationmarkTriangleFillIcon
            className={`${styles.infoIcon} ${styles.infoIcon__orange}`}
            fontSize="1.5rem"
            aria-hidden
          />
          <BodyLong className={styles.infoText}>
            <FormattedMessage
              id={
                isError
                  ? 'pensjonsavtaler.private.ingress.error.pensjonsavtaler'
                  : 'pensjonsavtaler.private.ingress.error.pensjonsavtaler.partial'
              }
            />
          </BodyLong>
        </div>
      )}

      {
        // Når private pensjonsavtaler feiler helt eller er partial med 0 avtaler
      }
      {isSuccess &&
        isPartialResponse &&
        privatePensjonsavtaler &&
        privatePensjonsavtaler?.length > 0 && (
          <div className={styles.info}>
            <ExclamationmarkTriangleFillIcon
              className={`${styles.infoIcon} ${styles.infoIcon__orange}`}
              fontSize="1.5rem"
              aria-hidden
            />
            <BodyLong className={styles.infoText}>
              <FormattedMessage id="pensjonsavtaler.private.ingress.error.pensjonsavtaler.partial" />
            </BodyLong>
          </div>
        )}

      {
        // Når private pensjonsavtaler er partial med noen avtaler
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
            ...getFormatMessageValues(intl),
          }}
        />
      </BodyLong>
    </>
  )
}
