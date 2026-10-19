// src/components/common/AFPRadioGroup.tsx
import { SanityAlert } from '@pensjonskalkulator-frontend-monorepo/sanity/SanityAlert'
import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Radio, RadioGroup } from '@navikt/ds-react'

import { ALERT_VIST } from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'

import styles from './AFP.module.scss'

interface AFPRadioGroupProps {
  afp: string | null
  handleRadioChange: (value: AfpRadio) => void
  validationError: string | undefined
  showApotekerAlert: boolean
  showVetIkkeAlert: boolean
}

const AFPRadioGroup: React.FC<AFPRadioGroupProps> = ({
  afp,
  handleRadioChange,
  validationError,
  showApotekerAlert,
  showVetIkkeAlert,
}) => {
  if (showApotekerAlert) {
    logger(ALERT_VIST, {
      tekst:
        'Beregning med AFP for apotekvirksomhet (POA) er for øyeblikket feil',
      variant: 'warning',
    })
  }

  return (
    <RadioGroup
      className={styles.radiogroup}
      legend={<FormattedMessage id="stegvisning.afp.radio_label" />}
      name="afp"
      data-testid="afp-radio-group"
      defaultValue={afp}
      onChange={handleRadioChange}
      error={validationError}
    >
      <Radio value="ja_offentlig" data-testid="afp-radio-ja-offentlig">
        <FormattedMessage id="stegvisning.afp.radio_ja_offentlig" />
      </Radio>
      {showApotekerAlert && (
        <SanityAlert
          id="apoteker.beregning-med-afp-feil"
          className={styles.alert}
        />
      )}
      <Radio value="ja_privat" data-testid="afp-radio-ja-privat">
        <FormattedMessage id="stegvisning.afp.radio_ja_privat" />
      </Radio>
      <Radio value="nei" data-testid="afp-radio-nei">
        <FormattedMessage id="stegvisning.afp.radio_nei" />
      </Radio>
      <Radio value="vet_ikke" data-testid="afp-radio-vet-ikke">
        <FormattedMessage id="stegvisning.afp.radio_vet_ikke" />
      </Radio>
      {showVetIkkeAlert && (
        <SanityAlert id="afp.vet-ikke" className={styles.alert} />
      )}
    </RadioGroup>
  )
}

export default AFPRadioGroup
