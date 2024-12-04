import React from 'react'
import { FormattedMessage } from 'react-intl'

import {
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
} from '@navikt/aksel-icons'
import { BodyLong } from '@navikt/ds-react'

import styles from './PensjonsavtalerInlineAlert.module.scss'

export const PensjonsavtalerInlineAlert = (props: {
  isPartialResponse: boolean
  isError?: boolean
  isSuccess: boolean
}) => {
  const { isPartialResponse, isError, isSuccess } = props

  return (
    <>
      {isPartialResponse && (
        <div className={styles.info}>
          <ExclamationmarkTriangleFillIcon
            className={`${styles.infoIcon} ${styles.infoIcon__orange}`}
            fontSize="1.5rem"
            aria-hidden
          />
          <BodyLong className={styles.infoText}>
            <FormattedMessage id="pensjonsavtaler.ingress.error.pensjonsavtaler.partial" />
          </BodyLong>
        </div>
      )}
      {isError && (
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
                  ? 'pensjonsavtaler.ingress.error.pensjonsavtaler'
                  : 'pensjonsavtaler.ingress.error.pensjonsavtaler.partial'
              }
            />
          </BodyLong>
        </div>
      )}
      {isSuccess && (
        <div className={`${styles.info}`}>
          <InformationSquareFillIcon
            className={`${styles.infoIcon} ${styles.infoIcon__blue}`}
            fontSize="1.5rem"
            aria-hidden
          />
          <BodyLong className={styles.infoText}>
            <FormattedMessage id="pensjonsavtaler.ingress.ingen" />
          </BodyLong>
        </div>
      )}
    </>
  )
}
