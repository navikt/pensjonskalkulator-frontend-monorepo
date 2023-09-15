import { FormEvent, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import {
  Alert,
  BodyLong,
  Button,
  Heading,
  Link,
  Radio,
  RadioGroup,
} from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { ReadMore } from '@/components/common/ReadMore'
import { logger, wrapLogger } from '@/utils/logging'
import { formatMessageValues } from '@/utils/translations'

import styles from './AFP.module.scss'

interface Props {
  afp: AfpRadio | null
  onCancel: () => void
  onPrevious: () => void
  onNext: (afpData: AfpRadio) => void
}

export function AFP({ afp, onCancel, onPrevious, onNext }: Props) {
  const intl = useIntl()
  const [validationError, setValidationError] = useState<string>('')
  const [showAlert, setShowAlert] = useState<AfpRadio | ''>('')

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const afpData = data.get('afp') as AfpRadio | undefined

    if (!afpData) {
      setValidationError(
        intl.formatMessage({
          id: 'stegvisning.afp.validation_error',
        })
      )
    } else {
      logger('radiogroup valgt', {
        tekst: 'Rett til AFP',
        valg: afpData,
      })
      onNext(afpData)
    }
  }

  const handleRadioChange = (value: AfpRadio): void => {
    setShowAlert(value)
    setValidationError('')
  }

  return (
    <Card aria-live="polite" hasLargePadding hasMargin>
      <form onSubmit={onSubmit}>
        <Heading level="2" size="medium" spacing>
          <FormattedMessage id="stegvisning.afp.title" />
        </Heading>
        <BodyLong size="large">
          <FormattedMessage id="stegvisning.afp.ingress" />
        </BodyLong>
        <ReadMore
          name="Avtalefestet pensjon i privat sektor"
          className={styles.readmorePrivat}
          header={
            <FormattedMessage id="stegvisning.afp.readmore_privat_title" />
          }
        >
          <FormattedMessage id="stegvisning.afp.readmore_list_title" />
          <ul className={styles.list}>
            <li>
              <FormattedMessage id="stegvisning.afp.readmore_privat_list_item1" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.afp.readmore_privat_list_item2" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.afp.readmore_privat_list_item3" />
            </li>
          </ul>
          <FormattedMessage
            id="stegvisning.afp.readmore_privat_link"
            values={{
              ...formatMessageValues,
            }}
          />
        </ReadMore>
        <ReadMore
          name="Avtalefestet pensjon i offentlig sektor"
          className={styles.readmoreOffentlig}
          header={
            <FormattedMessage id="stegvisning.afp.readmore_offentlig_title" />
          }
        >
          <FormattedMessage id="stegvisning.afp.readmore_list_title" />
          <ul className={styles.list}>
            <li>
              <FormattedMessage id="stegvisning.afp.readmore_offentlig_list_item1" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.afp.readmore_offentlig_list_item2" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.afp.readmore_offentlig_list_item3" />
            </li>
          </ul>
          <FormattedMessage id="stegvisning.afp.readmore_offentlig_ingress" />
        </ReadMore>
        <RadioGroup
          className={styles.radiogroup}
          legend={<FormattedMessage id="stegvisning.afp.radio_label" />}
          name="afp"
          defaultValue={afp}
          onChange={handleRadioChange}
          error={validationError}
          aria-required="true"
        >
          <Radio value="ja_offentlig">
            <FormattedMessage id="stegvisning.afp.radio_ja_offentlig" />
          </Radio>
          {showAlert === 'ja_offentlig' && (
            <Alert className={styles.alert} variant="info">
              <FormattedMessage id="stegvisning.afp.alert_ja_offentlig" />
            </Alert>
          )}
          <Radio value="ja_privat">
            <FormattedMessage id="stegvisning.afp.radio_ja_privat" />
          </Radio>
          <Radio value="nei">
            <FormattedMessage id="stegvisning.afp.radio_nei" />
          </Radio>
          <Radio value="vet_ikke">
            <FormattedMessage id="stegvisning.afp.radio_vet_ikke" />
          </Radio>
          {showAlert === 'vet_ikke' && (
            <Alert className={styles.alert} variant="info">
              <FormattedMessage id="stegvisning.afp.alert_vet_ikke" />
            </Alert>
          )}
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
