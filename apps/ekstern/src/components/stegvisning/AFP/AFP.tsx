import { FormEvent, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button, Heading, Ingress, Radio, RadioGroup } from '@navikt/ds-react'

import styles from './AFP.module.scss'

interface Props {
  afp: AfpRadio | null
  onCancel: () => void
  onPrevious: () => void
  onNext: (afpData: AfpRadio) => void
}

export type AfpRadio = 'ja_offentlig' | 'ja_privat' | 'nei' | 'vet_ikke'

export function AFP({ afp, onCancel, onPrevious, onNext }: Props) {
  const intl = useIntl()

  const [validationError, setValidationError] = useState<string>('')

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const afpData = data.get('afp')

    if (!afpData) {
      setValidationError(
        intl.formatMessage({
          id: 'stegvisning.afp.validation_error',
        })
      )
    } else {
      onNext(afpData as AfpRadio)
    }
  }

  const handleRadioChange = (): void => {
    setValidationError('')
  }

  return (
    <form onSubmit={onSubmit}>
      <section className={styles.section}>
        <Heading size="large" level="2" spacing>
          <FormattedMessage id="stegvisning.afp.title" />
        </Heading>
        <Ingress className={styles.ingress}>
          <FormattedMessage id="stegvisning.afp.ingress" />
        </Ingress>

        <RadioGroup
          legend={<FormattedMessage id="stegvisning.afp.radio_label" />}
          name={'afp'}
          defaultValue={afp}
          onChange={handleRadioChange}
          error={validationError}
          aria-required="true"
        >
          <Radio value="ja_offentlig">
            <FormattedMessage id="stegvisning.afp.radio_ja_offentlig" />
          </Radio>
          <Radio value="ja_privat">
            <FormattedMessage id="stegvisning.afp.radio_ja_privat" />
          </Radio>
          <Radio value="nei">
            <FormattedMessage id="stegvisning.afp.radio_nei" />
          </Radio>
          <Radio value="nei">
            <FormattedMessage id="stegvisning.afp.radio_vet_ikke" />
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
