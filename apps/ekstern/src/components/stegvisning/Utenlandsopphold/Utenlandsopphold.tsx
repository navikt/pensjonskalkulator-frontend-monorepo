import { useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Heading, Radio, RadioGroup } from '@navikt/ds-react'

import { UtenlandsoppholdListe } from '@/components/UtenlandsoppholdListe/UtenlandsoppholdListe'
import { Card } from '@/components/common/Card'
import { Divider } from '@/components/common/Divider'
import { SanityReadmore } from '@/components/common/SanityReadmore'
import { useAppSelector } from '@/state/hooks'
import { selectUtenlandsperioder } from '@/state/userInput/selectors'

import Navigation from '../Navigation/Navigation'
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

  const [validationErrors, setValidationErrors] = useState({
    top: '',
    bottom: '',
  })

  const [showUtenlandsperioder, setShowUtenlandsperioder] =
    useState<boolean>(!!harUtenlandsopphold)

  useEffect(() => {
    if (validationErrors.bottom && utenlandsperioder.length > 0) {
      setValidationErrors((prevState) => ({
        ...prevState,
        bottom: '',
      }))
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

      <Heading
        level="2"
        size="medium"
        spacing
        data-testid="stegvisning.utenlandsopphold.title"
      >
        <FormattedMessage id="stegvisning.utenlandsopphold.title" />
      </Heading>

      <BodyLong size="large" data-testid="stegvisning.utenlandsopphold.ingress">
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
        data-testid="stegvisning.utenlandsopphold.radio_label"
        defaultValue={
          harUtenlandsopphold
            ? 'ja'
            : harUtenlandsopphold === false
              ? 'nei'
              : null
        }
        onChange={handleRadioChange}
        error={validationErrors.top}
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

      <Navigation
        onPrevious={onPrevious}
        onCancel={onCancel}
        form="har-utenlandsopphold"
      />
    </Card>
  )
}
