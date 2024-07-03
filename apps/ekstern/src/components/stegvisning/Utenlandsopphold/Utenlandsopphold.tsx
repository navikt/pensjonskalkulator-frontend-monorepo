import React from 'react'
import { FormEvent, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { PlusCircleIcon } from '@navikt/aksel-icons'
import {
  BodyLong,
  BodyShort,
  Button,
  Heading,
  Radio,
  RadioGroup,
} from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { ReadMore } from '@/components/common/ReadMore'
import { OppholdModal } from '@/components/OppholdModal'
import { logger, wrapLogger } from '@/utils/logging'

import styles from './Utenlandsopphold.module.scss'

interface Props {
  harUtenlandsopphold: boolean | null
  onCancel?: () => void
  onPrevious: () => void
  onNext: (utenlandsoppholdData: BooleanRadio) => void
}

export function Utenlandsopphold({
  harUtenlandsopphold,
  onCancel,
  onPrevious,
  onNext,
}: Props) {
  const intl = useIntl()

  const oppholdModalRef = React.useRef<HTMLDialogElement>(null)
  const [validationError, setValidationError] = useState<string>('')
  const [showOppholdene, setShowOppholdene] =
    React.useState<boolean>(!!harUtenlandsopphold)

  const openOppholdModal = () => {
    logger('modal åpnet', {
      tekst: `Modal: Om oppholdet ditt`,
    })
    oppholdModalRef.current?.showModal()
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const utenlandsoppholdData = data.get('utenlandsopphold-radio') as
      | BooleanRadio
      | undefined
    if (!utenlandsoppholdData) {
      const tekst = intl.formatMessage({
        id: 'stegvisning.utenlandsopphold.validation_error',
      })
      setValidationError(tekst)
      logger('valideringsfeil', {
        data: intl.formatMessage({
          id: 'stegvisning.utenlandsopphold.radio_label',
        }),
        tekst,
      })
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

  const handleRadioChange = (value: BooleanRadio): void => {
    setShowOppholdene(value === 'ja')
    setValidationError('')
  }

  return (
    <Card hasLargePadding hasMargin>
      <form id="utenlandsopphold" onSubmit={onSubmit}></form>
      <Heading level="2" size="medium" spacing>
        <FormattedMessage id="stegvisning.utenlandsopphold.title" />
      </Heading>
      <BodyLong size="large">
        <FormattedMessage id="stegvisning.utenlandsopphold.ingress" />
      </BodyLong>
      <ReadMore
        name="Om hva som er opphold utenfor Norge"
        className={styles.readmore1}
        header={
          <FormattedMessage id="stegvisning.utenlandsopphold.readmore_opphold_utenfor_norge.title" />
        }
      >
        <FormattedMessage id="stegvisning.utenlandsopphold.readmore_opphold_utenfor_norge.ingress" />
      </ReadMore>
      <ReadMore
        name="Om konsekvenser av opphold i utlandet"
        className={styles.readmore2}
        header={
          <FormattedMessage id="stegvisning.utenlandsopphold.readmore_konsekvenser.title" />
        }
      >
        <FormattedMessage id="stegvisning.utenlandsopphold.readmore_konsekvenser.ingress" />
      </ReadMore>
      <RadioGroup
        name="utenlandsopphold-radio"
        className={styles.radiogroup}
        legend={
          <FormattedMessage id="stegvisning.utenlandsopphold.radio_label" />
        }
        description={
          <FormattedMessage id="stegvisning.utenlandsopphold.radio_label.description" />
        }
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
        <Radio form="utenlandsopphold" value="ja">
          <FormattedMessage id="stegvisning.utenlandsopphold.radio_ja" />
        </Radio>
        <Radio form="utenlandsopphold" value="nei">
          <FormattedMessage id="stegvisning.utenlandsopphold.radio_nei" />
        </Radio>
      </RadioGroup>
      {showOppholdene && (
        <section className={styles.oppholdene}>
          <Heading size="small" level="3">
            <FormattedMessage id="stegvisning.utenlandsopphold.oppholdene.title" />
          </Heading>
          <BodyShort size="medium" className={styles.bodyshort}>
            <FormattedMessage id="stegvisning.utenlandsopphold.oppholdene.description" />
          </BodyShort>
          <OppholdModal
            modalRef={oppholdModalRef}
            opphold={undefined}
            // TODO setState for valgt opphold
            // opphold={{
            //   land: 'Kina',
            //   harJobbet: null,
            //   startdato: new Date('2018-01-01'),
            //   sluttdato: new Date('2021-01-31'),
            // }}
          />
          <Button
            type="button"
            icon={<PlusCircleIcon aria-hidden />}
            onClick={openOppholdModal}
          >
            {intl.formatMessage({
              id: 'stegvisning.utenlandsopphold.oppholdene.button',
            })}
          </Button>
        </section>
      )}

      <Button form="utenlandsopphold" type="submit" className={styles.button}>
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
    </Card>
  )
}
