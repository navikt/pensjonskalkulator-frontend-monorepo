import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Alert, BodyLong, Heading } from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { SanityReadmore } from '@/components/common/SanityReadmore/SanityReadmore'
import { paths } from '@/router/constants'
import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import Navigation from '../Navigation/Navigation'

import styles from './Ufoere.module.scss'

interface Props {
  onCancel?: () => void
  onPrevious: () => void
  onNext?: () => void
}

export function Ufoere({ onCancel, onPrevious, onNext }: Props) {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    logger('button klikk', {
      tekst: `Neste fra ${paths.ufoeretrygdAFP}`,
    })
    if (onNext) {
      onNext()
    }
  }

  return (
    <Card hasLargePadding hasMargin>
      <form onSubmit={onSubmit}>
        <Heading level="2" size="medium" spacing>
          <FormattedMessage id="stegvisning.ufoere.title" />
        </Heading>

        <Alert
          data-testid="ufoere-info"
          className={styles.alert}
          variant="info"
          aria-live="polite"
        >
          <FormattedMessage
            id="stegvisning.ufoere.info"
            values={{ ...getFormatMessageValues() }}
          />
        </Alert>

        <SanityReadmore id="om_UT_AFP" className={styles.readmore1} />

        <BodyLong
          size="large"
          data-testid="ufoere-ingress"
          className={styles.paragraph}
        >
          <FormattedMessage
            id="stegvisning.ufoere.ingress"
            values={{ ...getFormatMessageValues() }}
          />
        </BodyLong>

        <Navigation onPrevious={onPrevious} onCancel={onCancel} />
      </form>
    </Card>
  )
}
