import React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@navikt/ds-react'

import { AVANSERT_FORM_NAMES } from '../utils'
import { BeregningContext } from '@/pages/Beregning/context'
import { useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectIsEndring,
} from '@/state/userInput/selectors'
import { wrapLogger } from '@/utils/logging'

import styles from './FormButtonRow.module.scss'

export const FormButtonRow: React.FC<{
  resetForm: () => void
  gaaTilResultat: () => void
  hasVilkaarIkkeOppfylt?: boolean
}> = ({ resetForm, gaaTilResultat, hasVilkaarIkkeOppfylt }) => {
  const intl = useIntl()
  const { harAvansertSkjemaUnsavedChanges } = React.useContext(BeregningContext)
  const { uttaksalder } = useAppSelector(selectCurrentSimulation)
  const isEndring = useAppSelector(selectIsEndring)

  return (
    <div className={styles.wrapper}>
      <hr className={styles.separator} />
      <div>
        <Button
          form={AVANSERT_FORM_NAMES.form}
          className={`${styles.button} ${styles.buttonSubmit}`}
        >
          {intl.formatMessage({
            id:
              uttaksalder &&
              !hasVilkaarIkkeOppfylt &&
              harAvansertSkjemaUnsavedChanges
                ? 'beregning.avansert.button.oppdater'
                : isEndring
                  ? 'beregning.avansert.button.beregn.endring'
                  : 'beregning.avansert.button.beregn',
          })}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={styles.button}
          onClick={wrapLogger('button klikk', {
            tekst: 'nullstiller avansert skjema',
          })(resetForm)}
        >
          {intl.formatMessage({
            id: 'beregning.avansert.button.nullstill',
          })}
        </Button>
      </div>
      {uttaksalder && !hasVilkaarIkkeOppfylt && (
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
