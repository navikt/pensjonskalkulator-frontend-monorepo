import { useIntl, FormattedMessage } from 'react-intl'
import { Link as ReactRouterLink } from 'react-router-dom'

import { BodyLong, Button, Heading, Link } from '@navikt/ds-react'

import FridaPortrett from '../../../assets/frida.svg'
import { Card } from '@/components/common/Card'
import { paths } from '@/router'
import { wrapLogger } from '@/utils/logging'

import styles from './Start.module.scss'

interface Props {
  fornavn: string
  onCancel: () => void
  onNext: () => void
}

export function Start({ fornavn, onCancel, onNext }: Props) {
  const intl = useIntl()
  const fornavnString = fornavn !== '' ? ` ${fornavn}!` : '!'

  return (
    <Card hasLargePadding hasMargin>
      <div className={styles.wrapper}>
        <img className={styles.image} src={FridaPortrett} alt="" />
        <div className={styles.wrapperText}>
          <Heading level="2" size="medium" spacing>
            {`${intl.formatMessage({
              id: 'stegvisning.start.title',
            })}${fornavnString}`}
          </Heading>
          <BodyLong size="large">
            <FormattedMessage id="stegvisning.start.ingress" />
          </BodyLong>
          <Button type="submit" className={styles.button} onClick={onNext}>
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
        className={styles.link}
        as={ReactRouterLink}
        to={paths.personopplysninger}
      >
        <FormattedMessage id="stegvisning.start.link" />
      </Link>
    </Card>
  )
}
