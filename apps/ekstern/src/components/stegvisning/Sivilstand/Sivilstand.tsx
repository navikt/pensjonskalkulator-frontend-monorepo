import { FormEvent, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Ingress, Button, Heading, Radio, RadioGroup } from '@navikt/ds-react'

import { ResponsiveCard } from '@/components/components/ResponsiveCard'

import styles from './Sivilstand.module.scss'

interface Props {
  harSamboer: boolean | null
  onCancel: () => void
  onPrevious: () => void
  onNext: (sivilstandData: SivilstandRadio) => void
}

export type SivilstandRadio = 'ja' | 'nei'

export function Sivilstand({
  harSamboer,
  onCancel,
  onPrevious,
  onNext,
}: Props) {
  const intl = useIntl()
  const [validationError, setValidationError] = useState<string>('')

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const sivilstandData = data.get('sivilstand')

    if (!sivilstandData) {
      setValidationError(
        intl.formatMessage({
          id: 'stegvisning.sivilstand.validation_error',
        })
      )
    } else {
      onNext(sivilstandData as SivilstandRadio)
    }
  }

  const handleRadioChange = (): void => {
    setValidationError('')
  }

  return (
    <form onSubmit={onSubmit}>
      <ResponsiveCard aria-live="polite" hasLargePadding hasMargin>
        <Heading level="2" size="large" spacing>
          <FormattedMessage id="stegvisning.sivilstand.title" />
        </Heading>
        <Ingress className={styles.ingress}>
          <FormattedMessage id="stegvisning.sivilstand.ingress" />
        </Ingress>

        <RadioGroup
          legend={<FormattedMessage id="stegvisning.sivilstand.radio_label" />}
          name="sivilstand"
          className={styles.radiogroup}
          defaultValue={harSamboer ? 'ja' : harSamboer === false ? 'nei' : null}
          onChange={handleRadioChange}
          error={validationError}
          aria-required="true"
        >
          <Radio value="ja">
            <FormattedMessage id="stegvisning.sivilstand.radio_ja" />
          </Radio>
          <Radio value="nei">
            <FormattedMessage id="stegvisning.sivilstand.radio_nei" />
          </Radio>
        </RadioGroup>

        <Button type="submit" className={styles.button}>
          <FormattedMessage id="stegvisning.beregn" />
        </Button>
        <Button
          type="button"
          className={styles.button}
          variant="secondary"
          onClick={onPrevious}
        >
          <FormattedMessage id="stegvisning.tilbake" />
        </Button>
        <Button
          type="button"
          className={styles.button}
          variant="tertiary"
          onClick={onCancel}
        >
          <FormattedMessage id="stegvisning.avbryt" />
        </Button>
      </ResponsiveCard>
    </form>
  )
}
