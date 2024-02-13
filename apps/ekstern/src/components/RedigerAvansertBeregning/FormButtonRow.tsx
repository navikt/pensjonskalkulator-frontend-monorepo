import React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@navikt/ds-react'

import { FORM_NAMES } from './utils'

import styles from './FormButtonRow.module.scss'

export const FormButtonRow: React.FC<{
  hasUnsavedChanges: boolean
  resetForm: () => void
  gaaTilResultat: () => void
}> = ({ hasUnsavedChanges, resetForm, gaaTilResultat }) => {
  const intl = useIntl()

  return (
    <div className={styles.wrapper}>
      <hr className={styles.separator} />
      <div>
        <Button
          form={FORM_NAMES.form}
          className={`${styles.button} ${styles.buttonSubmit}`}
        >
          {intl.formatMessage({
            id: hasUnsavedChanges
              ? 'beregning.avansert.button.oppdater'
              : 'beregning.avansert.button.beregn',
          })}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={resetForm}
          className={styles.button}
        >
          {intl.formatMessage({
            id: 'beregning.avansert.button.nullstill',
          })}
        </Button>
      </div>
      {hasUnsavedChanges && (
        <div>
          <Button
            type="button"
            variant="tertiary"
            className={styles.button}
            onClick={gaaTilResultat}
          >
            {intl.formatMessage({
              id: 'beregning.avansert.button.avbryt',
            })}
          </Button>
        </div>
      )}
    </div>
  )
}
