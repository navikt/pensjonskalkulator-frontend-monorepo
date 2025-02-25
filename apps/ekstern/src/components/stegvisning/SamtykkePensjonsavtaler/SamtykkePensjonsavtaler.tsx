import { FormEvent, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Button, Heading, Radio, RadioGroup } from '@navikt/ds-react'

import { STEGVISNING_FORM_NAMES } from '../utils'
import { Card } from '@/components/common/Card'
import { ReadMore } from '@/components/common/ReadMore/ReadMore'
import { paths } from '@/router/constants'
import { logger, wrapLogger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './SamtykkePensjonsavtaler.module.scss'

interface Props {
  harSamtykket: boolean | null
  onCancel?: () => void
  onPrevious: () => void
  onNext: (samtykkeData: BooleanRadio) => void
}

export function SamtykkePensjonsavtaler({
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
    const samtykkeData = data.get('samtykke') as BooleanRadio | undefined

    if (!samtykkeData) {
      const tekst = intl.formatMessage({
        id: 'stegvisning.samtykke_pensjonsavtaler.validation_error',
      })
      setValidationError(tekst)
      logger('skjema validering feilet', {
        skjemanavn: STEGVISNING_FORM_NAMES.samtykkePensjonsavtaler,
        data: intl.formatMessage({
          id: 'stegvisning.samtykke_pensjonsavtaler.radio_label',
        }),
        tekst,
      })
    } else {
      logger('radiogroup valgt', {
        tekst: 'Samtykke',
        valg: samtykkeData,
      })
      logger('button klikk', {
        tekst: `Neste fra ${paths.samtykke}`,
      })
      onNext(samtykkeData)
    }
  }

  const handleRadioChange = (): void => {
    setValidationError('')
  }

  return (
    <Card hasLargePadding hasMargin>
      <form onSubmit={onSubmit}>
        <Heading level="2" size="medium" spacing>
          <FormattedMessage id="stegvisning.samtykke_pensjonsavtaler.title" />
        </Heading>
        <BodyLong size="large">
          <FormattedMessage
            id="stegvisning.samtykke_pensjonsavtaler.ingress"
            values={{ ...getFormatMessageValues() }}
          />
        </BodyLong>
        <ReadMore
          name="Dette henter vi fra offentlige tjenestepensjonsordninger"
          className={styles.readmoreOffentlig}
          header={
            <FormattedMessage id="stegvisning.samtykke_pensjonsavtaler.offentlig.readmore_title" />
          }
        >
          <FormattedMessage
            id="stegvisning.samtykke_pensjonsavtaler.offentlig.readmore_ingress"
            values={{ ...getFormatMessageValues() }}
          />
        </ReadMore>
        <ReadMore
          name="Dette henter vi fra Norsk Pensjon om pensjonsavtaler fra privat sektor"
          className={styles.readmorePrivat}
          header={
            <FormattedMessage id="stegvisning.samtykke_pensjonsavtaler.privat.readmore_title" />
          }
        >
          <FormattedMessage
            id="stegvisning.samtykke_pensjonsavtaler.privat.readmore_ingress"
            values={{ ...getFormatMessageValues() }}
          />
          <ul className={styles.list}>
            <li>
              <FormattedMessage id="stegvisning.samtykke_pensjonsavtaler.privat.readmore_list_item1" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.samtykke_pensjonsavtaler.privat.readmore_list_item2" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.samtykke_pensjonsavtaler.privat.readmore_list_item3" />
            </li>
          </ul>
        </ReadMore>

        <RadioGroup
          className={styles.radiogroup}
          legend={
            <FormattedMessage id="stegvisning.samtykke_pensjonsavtaler.radio_label" />
          }
          description={
            <FormattedMessage id="stegvisning.samtykke_pensjonsavtaler.radio_description" />
          }
          name="samtykke"
          defaultValue={
            harSamtykket ? 'ja' : harSamtykket === false ? 'nei' : null
          }
          onChange={handleRadioChange}
          error={validationError}
          role="radiogroup"
          aria-required="true"
        >
          <Radio value="ja">
            <FormattedMessage id="stegvisning.samtykke_pensjonsavtaler.radio_ja" />
          </Radio>
          <Radio value="nei">
            <FormattedMessage id="stegvisning.samtykke_pensjonsavtaler.radio_nei" />
          </Radio>
        </RadioGroup>

        <Button type="submit" className={styles.button}>
          <FormattedMessage id="stegvisning.neste" />
        </Button>
        <Button
          type="button"
          className={styles.button}
          variant="secondary"
          onClick={wrapLogger('button klikk', {
            tekst: `Tilbake fra ${paths.samtykke}`,
          })(onPrevious)}
        >
          <FormattedMessage id="stegvisning.tilbake" />
        </Button>
        {onCancel && (
          <Button
            type="button"
            className={styles.button}
            variant="tertiary"
            onClick={wrapLogger('button klikk', { tekst: 'Avbryt' })(onCancel)}
          >
            <FormattedMessage id="stegvisning.avbryt" />
          </Button>
        )}
      </form>
    </Card>
  )
}
