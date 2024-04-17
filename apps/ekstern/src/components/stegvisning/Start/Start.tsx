import { useIntl, FormattedMessage } from 'react-intl'
import { Link as ReactRouterLink } from 'react-router-dom'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { BodyLong, Button, Heading, Link } from '@navikt/ds-react'

import FridaPortrett from '../../../assets/frida.svg'
import { Card } from '@/components/common/Card'
import { paths } from '@/router/constants'
import { logOpenLink, wrapLogger } from '@/utils/logging'

import styles from './Start.module.scss'

interface Props {
  navn: string
  onCancel: () => void
  onNext: () => void
}

export function Start({ navn, onCancel, onNext }: Props) {
  const intl = useIntl()
  const navnString = navn !== '' ? ` ${navn}!` : '!'

  return (
    <Card hasLargePadding hasMargin>
      <div className={styles.wrapper}>
        <img className={styles.image} src={FridaPortrett} alt="" />
        <div className={styles.wrapperText}>
          <Heading level="2" size="medium" spacing>
            {`${intl.formatMessage({
              id: 'stegvisning.start.title',
            })}${navnString}`}
          </Heading>
          <BodyLong size="large">
            <FormattedMessage id="stegvisning.start.ingress" />
          </BodyLong>
          <Button
            type="submit"
            className={styles.button}
            onClick={wrapLogger('button klikk', { tekst: 'Kom i gang' })(
              onNext
            )}
          >
            <FormattedMessage id="stegvisning.start.button" />
          </Button>
          <Button
            type="button"
            variant="tertiary"
            onClick={wrapLogger('button klikk', { tekst: 'Avbryt' })(onCancel)}
          >
            <FormattedMessage id="stegvisning.avbryt" />
          </Button>
        </div>
      </div>
      <Link
        onClick={logOpenLink}
        className={styles.link}
        as={ReactRouterLink}
        to={paths.personopplysninger}
        target="_blank"
        inlineText
      >
        <FormattedMessage id="stegvisning.start.link" />
        <ExternalLinkIcon
          title={intl.formatMessage({
            id: 'application.global.external_link',
          })}
          width="1.25rem"
          height="1.25rem"
        />
      </Link>
    </Card>
  )
}
