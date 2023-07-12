import { useIntl, FormattedMessage } from 'react-intl'

import { Ingress, Button, Heading } from '@navikt/ds-react'

import FridaPortrett from '../../../assets/frida.svg'
import { StegvisningFrame } from '@/components/stegvisning/components/StegvisningFrame'

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
    <StegvisningFrame>
      <div className={styles.wrapper}>
        <img
          className={styles.image}
          src={FridaPortrett}
          alt={intl.formatMessage({
            id: 'stegvisning.start.bildetekst',
          })}
        />
        <div className={styles.wrapperText}>
          <Heading size="large" level="2" spacing>
            {`${intl.formatMessage({
              id: 'stegvisning.start.title',
            })}${fornavnString}`}
          </Heading>
          <Ingress>
            <FormattedMessage id="stegvisning.start.ingress" />
          </Ingress>
          <Button type="submit" className={styles.button} onClick={onNext}>
            <FormattedMessage id="stegvisning.start.start" />
          </Button>
          <Button type="button" variant="tertiary" onClick={onCancel}>
            <FormattedMessage id="stegvisning.avbryt" />
          </Button>
        </div>
      </div>
    </StegvisningFrame>
  )
}
