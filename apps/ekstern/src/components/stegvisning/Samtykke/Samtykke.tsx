import { FormEvent, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Ingress,
  BodyLong,
  Button,
  Heading,
  Radio,
  RadioGroup,
  ReadMore,
} from '@navikt/ds-react'

import styles from './Samtykke.module.scss'

interface Props {
  harSamtykket: boolean | null
  onCancel: () => void
  onPrevious: () => void
  onNext: (samtykkeData: SamtykkeRadio) => void
}

export type SamtykkeRadio = 'ja' | 'nei'

export function Samtykke({
  harSamtykket,
  onCancel,
  onPrevious,
  onNext,
}: Props) {
  const intl = useIntl()

  const [validationError, setValidationError] = useState<string>('')

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const samtykkeData = data.get('samtykke')

    if (!samtykkeData) {
      setValidationError(
        intl.formatMessage({
          id: 'stegvisning.samtykke.validation_error',
        })
      )
    } else {
      onNext(samtykkeData as SamtykkeRadio)
    }
  }

  const handleRadioChange = (): void => {
    setValidationError('')
  }

  return (
    <form onSubmit={onSubmit}>
      <section className={styles.section}>
        <Heading size="large" level="2" spacing>
          <FormattedMessage id="stegvisning.samtykke.title" />
        </Heading>
        <Ingress>
          <FormattedMessage id="stegvisning.samtykke.ingress" />
        </Ingress>
        <ReadMore
          className={styles.readmore}
          header={<FormattedMessage id="stegvisning.samtykke.readmore_title" />}
        >
          <FormattedMessage id="stegvisning.samtykke.readmore_ingress" />
          <br />
          <br />
          <FormattedMessage id="stegvisning.samtykke.readmore_list_title" />
          <ul>
            <li>
              <FormattedMessage id="stegvisning.samtykke.readmore_list_item1" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.samtykke.readmore_list_item2" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.samtykke.readmore_list_item3" />
            </li>
          </ul>
        </ReadMore>

        <RadioGroup
          legend={<FormattedMessage id="stegvisning.samtykke.radio_label" />}
          name={'samtykke'}
          defaultValue={
            harSamtykket ? 'ja' : harSamtykket === false ? 'nei' : null
          }
          onChange={handleRadioChange}
          error={validationError}
          aria-required="true"
        >
          <Radio value="ja">
            <FormattedMessage id="stegvisning.samtykke.radio_ja" />
          </Radio>
          <Radio value="nei">
            <FormattedMessage id="stegvisning.samtykke.radio_nei" />
          </Radio>
        </RadioGroup>

        <Button type={'submit'} className={styles.button}>
          <FormattedMessage id="stegvisning.neste" />
        </Button>
        <Button
          type={'button'}
          className={styles.button}
          variant="secondary"
          onClick={onPrevious}
        >
          <FormattedMessage id="stegvisning.tilbake" />
        </Button>
        <Button type={'button'} variant="tertiary" onClick={onCancel}>
          <FormattedMessage id="stegvisning.avbryt" />
        </Button>
      </section>
    </form>
  )
}
