// src/components/common/AFPRadioGroup.tsx
import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Alert, Radio, RadioGroup } from '@navikt/ds-react'

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
      <Radio value="ja_offentlig">
        <FormattedMessage id="stegvisning.afp.radio_ja_offentlig" />
      </Radio>
      {showApotekerAlert && (
        <Alert className={styles.alert} variant="warning" aria-live="polite">
          <FormattedMessage id="error.apoteker_warning" />
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
      {showVetIkkeAlert && (
        <Alert className={styles.alert} variant="info" aria-live="polite">
          <FormattedMessage id="stegvisning.afp.alert_vet_ikke" />
        </Alert>
      )}
    </RadioGroup>
  )
}

export default AFPRadioGroup
