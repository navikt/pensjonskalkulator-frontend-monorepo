import { FormEvent, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Button, Heading, Radio, RadioGroup } from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { ReadMore } from '@/components/common/ReadMore/ReadMore'
import logger, { wrapLogger } from '@/utils/logging'

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
    const samtykkeData = data.get('samtykke') as SamtykkeRadio | undefined

    if (!samtykkeData) {
      setValidationError(
        intl.formatMessage({
          id: 'stegvisning.samtykke.validation_error',
        })
      )
    } else {
      logger('radiogroup valgt', {
        tekst: 'Samtykke',
        valg: samtykkeData,
      })
      onNext(samtykkeData)
    }
  }

  const handleRadioChange = (): void => {
    setValidationError('')
  }

  return (
    <Card aria-live="polite" hasLargePadding hasMargin>
      <form onSubmit={onSubmit}>
        <Heading level="2" size="medium" spacing>
          <FormattedMessage id="stegvisning.samtykke.title" />
        </Heading>
        <BodyLong size="large">
          <FormattedMessage id="stegvisning.samtykke.ingress" />
        </BodyLong>
        <ReadMore
          name="Disse opplysningene henter vi"
          className={styles.readmore}
          header={<FormattedMessage id="stegvisning.samtykke.readmore_title" />}
        >
          <FormattedMessage id="stegvisning.samtykke.readmore_ingress" />
          <br />
          <br />
          <FormattedMessage id="stegvisning.samtykke.readmore_list_title" />
          <ul className={styles.list}>
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
          className={styles.radiogroup}
          legend={<FormattedMessage id="stegvisning.samtykke.radio_label" />}
          name="samtykke"
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
