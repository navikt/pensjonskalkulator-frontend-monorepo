import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Button, Heading, Radio, RadioGroup } from '@navikt/ds-react'

import { UtenlandsoppholdListe } from '@/components/UtenlandsoppholdListe/UtenlandsoppholdListe'
import { Card } from '@/components/common/Card'
import { Divider } from '@/components/common/Divider'
import { SanityReadmore } from '@/components/common/SanityReadmore'
import { paths } from '@/router/constants'
import { useAppSelector } from '@/state/hooks'
import { selectUtenlandsperioder } from '@/state/userInput/selectors'
import { wrapLogger } from '@/utils/logging'

import { onSubmit } from './utils'

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

  const utenlandsperioder = useAppSelector(selectUtenlandsperioder)

  const [validationErrors, setValidationErrors] = React.useState<
    Record<'top' | 'bottom', string>
  >({
    top: '',
    bottom: '',
  })

  const [showUtenlandsperioder, setShowUtenlandsperioder] =
    React.useState<boolean>(!!harUtenlandsopphold)

  React.useEffect(() => {
    if (validationErrors.bottom && utenlandsperioder.length > 0) {
      setValidationErrors((prevState) => {
        return {
          ...prevState,
          bottom: '',
        }
      })
    }
  }, [utenlandsperioder])

  const handleRadioChange = (value: BooleanRadio): void => {
    setShowUtenlandsperioder(value === 'ja')
    setValidationErrors({ top: '', bottom: '' })
  }

  return (
    <Card hasLargePadding hasMargin>
      <form
        id="har-utenlandsopphold"
        onSubmit={(e) => {
          e.preventDefault()
          const data = new FormData(e.currentTarget)
          onSubmit(
            data.get('har-utenlandsopphold-radio'),
            intl,
            setValidationErrors,
            utenlandsperioder.length,
            onNext
          )
        }}
      />

      <Heading level="2" size="medium" spacing>
        <FormattedMessage id="stegvisning.utenlandsopphold.title" />
      </Heading>

      <BodyLong size="large">
        <FormattedMessage id="stegvisning.utenlandsopphold.ingress" />
      </BodyLong>

      <SanityReadmore
        id="hva_er_opphold_utenfor_norge"
        className={styles.readmore1}
      />
      <SanityReadmore
        id="betydning_av_opphold_utenfor_norge"
        className={styles.readmore2}
      />
      <RadioGroup
        name="har-utenlandsopphold-radio"
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
        error={validationErrors.top}
        role="radiogroup"
        aria-required="true"
      >
        <Radio form="har-utenlandsopphold" value="ja">
          <FormattedMessage id="stegvisning.utenlandsopphold.radio_ja" />
        </Radio>

        <Radio form="har-utenlandsopphold" value="nei">
          <FormattedMessage id="stegvisning.utenlandsopphold.radio_nei" />
        </Radio>
      </RadioGroup>

      {showUtenlandsperioder && (
        <>
          <UtenlandsoppholdListe validationError={validationErrors.bottom} />

          <BodyLong size="medium" className={styles.ingressBottom}>
            <FormattedMessage id="stegvisning.utenlandsopphold.ingress.bottom" />
          </BodyLong>

          <Divider smallMargin />
        </>
      )}

      <Button
        form="har-utenlandsopphold"
        type="submit"
        className={styles.button}
      >
        <FormattedMessage id="stegvisning.neste" />
      </Button>

      <Button
        type="button"
        className={styles.button}
        variant="secondary"
        onClick={wrapLogger('button klikk', {
          tekst: `Tilbake fra ${paths.utenlandsopphold}`,
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
    </Card>
  )
}
