import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { BodyLong, Button, Heading } from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { wrapLogger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './OffentligTP.module.scss'

interface Props {
  shouldRedirectTo?: string
  onCancel?: () => void
  onPrevious: () => void
  onNext: () => void
}

export function OffentligTP({
  shouldRedirectTo,
  onCancel,
  onPrevious,
  onNext,
}: Props) {
  const intl = useIntl()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (shouldRedirectTo) {
      navigate(shouldRedirectTo)
    }
  }, [shouldRedirectTo])

  return (
    !shouldRedirectTo && (
      <Card hasLargePadding hasMargin>
        <Heading level="2" size="medium" spacing>
          <FormattedMessage id="stegvisning.offentligtp.title" />
        </Heading>
        <BodyLong>
          <FormattedMessage
            id="stegvisning.offentligtp.ingress"
            values={{
              ...getFormatMessageValues(intl),
            }}
          />
        </BodyLong>
        <Button
          type="submit"
          className={styles.button}
          onClick={wrapLogger('button klikk', { tekst: 'Neste' })(onNext)}
        >
          <FormattedMessage id="stegvisning.neste" />
        </Button>
        <Button
          type="button"
          className={styles.button}
          variant="secondary"
          onClick={wrapLogger('button klikk', { tekst: 'Tilbake' })(onPrevious)}
        >
          <FormattedMessage id="stegvisning.tilbake" />
        </Button>
        {onCancel && (
          <Button
            type="button"
            className={styles.button}
            variant="tertiary"
            onClick={wrapLogger('button klikk', { tekst: 'Avbryt' })(onCancel)}
          >
            <FormattedMessage id="stegvisning.avbryt" />
          </Button>
        )}
      </Card>
    )
  )
}
