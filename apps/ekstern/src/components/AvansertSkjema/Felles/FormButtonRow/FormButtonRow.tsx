import React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@navikt/ds-react'

import { BeregningContext } from '@/pages/Beregning/context'
import { useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectIsEndring,
} from '@/state/userInput/selectors'
import { logger, wrapLogger } from '@/utils/logging'

import styles from './FormButtonRow.module.scss'

export const FormButtonRow: React.FC<{
  // TODO sterkere typing for formId etterhvert slik at bare de skjemaene som er definert kan brukes
  formId: string
  resetForm: () => void
  gaaTilResultat: () => void
  hasVilkaarIkkeOppfylt?: boolean
}> = ({ formId, resetForm, gaaTilResultat, hasVilkaarIkkeOppfylt }) => {
  const intl = useIntl()
  const { harAvansertSkjemaUnsavedChanges } = React.useContext(BeregningContext)
  const { uttaksalder } = useAppSelector(selectCurrentSimulation)
  const isEndring = useAppSelector(selectIsEndring)

  const getButtonMessageId = () => {
    if (
      uttaksalder &&
      !hasVilkaarIkkeOppfylt &&
      harAvansertSkjemaUnsavedChanges
    ) {
      return 'beregning.avansert.button.oppdater'
    }
    return isEndring
      ? 'beregning.avansert.button.beregn.endring'
      : 'beregning.avansert.button.beregn'
  }

  return (
    <div className={styles.wrapper}>
      <hr className={styles.separator} />

      <div>
        <Button
          form={formId}
          className={`${styles.button} ${styles.buttonSubmit}`}
        >
          {intl.formatMessage({ id: getButtonMessageId() })}
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
            onClick={() => {
              logger('button klikk', {
                tekst: 'Beregning avansert: Avbryt endring',
              })
              gaaTilResultat()
            }}
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
