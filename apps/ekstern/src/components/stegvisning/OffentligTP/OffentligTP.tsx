import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Button, Heading } from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { wrapLogger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './OffentligTP.module.scss'

interface Props {
  onCancel: () => void
  onPrevious: () => void
  onNext: () => void
  shouldJumpOverStep?: boolean
}

export function OffentligTP({
  onCancel,
  onPrevious,
  onNext,
  shouldJumpOverStep,
}: Props) {
  const intl = useIntl()

  React.useEffect(() => {
    if (shouldJumpOverStep) {
      onNext()
    }
  }, [shouldJumpOverStep])

  return (
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
      <Button
        type="button"
        className={styles.button}
        variant="tertiary"
        onClick={wrapLogger('button klikk', { tekst: 'Avbryt' })(onCancel)}
      >
        <FormattedMessage id="stegvisning.avbryt" />
      </Button>
    </Card>
  )
}
