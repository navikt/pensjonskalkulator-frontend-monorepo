import { FormEvent, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Button, Heading, Radio, RadioGroup } from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { logger, wrapLogger } from '@/utils/logging'

import styles from './Utenlandsopphold.module.scss'

interface Props {
  harUtenlandsopphold: boolean | null
  onCancel: () => void
  onPrevious: () => void
  onNext: (utenlandsoppholdData: UtenlandsoppholdRadio) => void
}

export type UtenlandsoppholdRadio = 'ja' | 'nei'

export function Utenlandsopphold({
  harUtenlandsopphold,
  onCancel,
  onPrevious,
  onNext,
}: Props) {
  const intl = useIntl()
  const [validationError, setValidationError] = useState<string>('')

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const utenlandsoppholdData = data.get('utenlandsopphold') as
      | UtenlandsoppholdRadio
      | undefined

    if (!utenlandsoppholdData) {
      setValidationError(
        intl.formatMessage({
          id: 'stegvisning.utenlandsopphold.validation_error',
        })
      )
    } else {
      logger('radiogroup valgt', {
        tekst: 'Utenlandsopphold',
        valg: utenlandsoppholdData,
      })
      logger('button klikk', {
        tekst: 'Neste',
      })
      onNext(utenlandsoppholdData)
    }
  }

  const handleRadioChange = (): void => {
    setValidationError('')
  }

  return (
    <Card hasLargePadding hasMargin>
      <form onSubmit={onSubmit}>
        <Heading level="2" size="medium" spacing>
          <FormattedMessage id="stegvisning.utenlandsopphold.title" />
        </Heading>
        <BodyLong size="large">
          <FormattedMessage id="stegvisning.utenlandsopphold.ingress" />
        </BodyLong>
        <RadioGroup
          className={styles.radiogroup}
          legend={
            <FormattedMessage id="stegvisning.utenlandsopphold.radio_label" />
          }
          name="utenlandsopphold"
          defaultValue={
            harUtenlandsopphold
              ? 'ja'
              : harUtenlandsopphold === false
                ? 'nei'
                : null
          }
          onChange={handleRadioChange}
          error={validationError}
          role="radiogroup"
          aria-required="true"
        >
          <Radio value="ja">
            <FormattedMessage id="stegvisning.utenlandsopphold.radio_ja" />
          </Radio>
          <Radio value="nei">
            <FormattedMessage id="stegvisning.utenlandsopphold.radio_nei" />
          </Radio>
        </RadioGroup>

        <Button type="submit" className={styles.button}>
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
      </form>
    </Card>
  )
}
