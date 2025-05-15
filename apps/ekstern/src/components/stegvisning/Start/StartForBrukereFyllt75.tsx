import clsx from 'clsx'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Button, HStack, Heading } from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { externalUrls, paths } from '@/router/constants'
import { wrapLogger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import { useStegvisningNavigation } from '../stegvisning-hooks'

import styles from './Start.module.scss'

export function StartForBrukereFyllt75() {
  const intl = useIntl()
  const [{ onStegvisningCancel }] = useStegvisningNavigation(paths.start)
  const navigateToDinPensjon = () => {
    window.location.href = externalUrls.dinPensjonInnlogget
  }

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'stegvisning.start_brukere_fyllt_75.title',
    })
  }, [])

  return (
    <Card hasLargePadding hasMargin>
      <div className={clsx(styles.wrapper, styles.wrapperFlexColumn)}>
        <Heading
          level="2"
          size="medium"
          spacing
          data-testid="start-brukere-fyllt-75-title"
        >
          <FormattedMessage id="stegvisning.start_brukere_fyllt_75.title" />
        </Heading>
        <BodyLong data-testid="start-brukere-fyllt-75-ingress">
          <FormattedMessage
            id="stegvisning.start_brukere_fyllt_75.ingress"
            values={{
              ...getFormatMessageValues(),
            }}
          />
        </BodyLong>
        <HStack gap="4" marginBlock="6 0">
          <Button
            data-testid="start-brukere-fyllt-75-din-pensjon-button"
            type="submit"
            variant="primary"
            onClick={wrapLogger('button klikk', {
              tekst: 'Go til Din pensjon',
            })(navigateToDinPensjon)}
          >
            <FormattedMessage id="stegvisning.start_brukere_fyllt_75.button" />
          </Button>
          <Button
            data-testid="start-brukere-fyllt-75-avbryt-button"
            variant="tertiary"
            onClick={wrapLogger('button klikk', {
              tekst: 'Avbryt',
            })(onStegvisningCancel)}
          >
            <FormattedMessage id="stegvisning.start_brukere_fyllt_75.avbryt" />
          </Button>
        </HStack>
      </div>
    </Card>
  )
}
