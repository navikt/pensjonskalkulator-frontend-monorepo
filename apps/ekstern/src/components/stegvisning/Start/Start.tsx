import { useIntl, FormattedMessage } from 'react-intl'

import { Ingress, Button, Heading } from '@navikt/ds-react'

import FridaPortrett from '../../../assets/frida.svg'
import { ResponsiveCard } from '@/components/components/ResponsiveCard'

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
    <ResponsiveCard hasLargePadding>
      <div className={styles.wrapper}>
        <img className={styles.image} src={FridaPortrett} alt="" />
        <div className={styles.wrapperText}>
          <Heading level="2" size="large" spacing>
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
    </ResponsiveCard>
  )
}
