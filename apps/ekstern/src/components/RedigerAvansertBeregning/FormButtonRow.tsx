import React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@navikt/ds-react'

import { FORM_NAMES } from './utils'

import styles from './FormButtonRow.module.scss'

export const FormButtonRow: React.FC<{
  isFormUnderUpdate: boolean
  resetForm: () => void
  gaaTilResultat: () => void
}> = ({ isFormUnderUpdate, resetForm, gaaTilResultat }) => {
  const intl = useIntl()

  return (
    <>
      <hr className={styles.separator} />
      <div>
        <Button form={FORM_NAMES.form}>
          {intl.formatMessage({
            id: isFormUnderUpdate
              ? 'beregning.avansert.button.oppdater'
              : 'beregning.avansert.button.beregn',
          })}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={resetForm}
          className={styles.buttonNullstill}
        >
          {intl.formatMessage({
            id: 'beregning.avansert.button.nullstill',
          })}
        </Button>
      </div>
      {isFormUnderUpdate && (
        <div>
          <Button
            type="button"
            variant="tertiary"
            className={styles.buttonAvbryt}
            onClick={gaaTilResultat}
          >
            {intl.formatMessage({
              id: 'beregning.avansert.button.avbryt',
            })}
          </Button>
        </div>
      )}
    </>
  )
}
