import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { BodyLong, Button, Modal, ToggleGroup } from '@navikt/ds-react'
import Highcharts from 'highcharts'
import HighchartsAccessibility from 'highcharts/modules/accessibility'

import { LightBlueFooter } from '@/components/LightBlueFooter'
import { paths } from '@/router/constants'
import {
  useGetHighchartsAccessibilityPluginFeatureToggleQuery,
  useGetDetaljertFaneFeatureToggleQuery,
} from '@/state/api/apiSlice'
import { useAppDispatch } from '@/state/hooks'
import { useAppSelector } from '@/state/hooks'
import { selectCurrentSimulation } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { logger } from '@/utils/logging'

import { BeregningAvansert } from './BeregningAvansert'
import { BeregningEnkel } from './BeregningEnkel'
import { BeregningContext, AvansertBeregningModus } from './context'

import styles from './Beregning.module.scss'

type BeregningVisning = 'enkel' | 'avansert'

interface Props {
  visning: BeregningVisning
}

export const Beregning: React.FC<Props> = ({ visning }) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { uttaksalder } = useAppSelector(selectCurrentSimulation)
  const avbrytModalRef = React.useRef<HTMLDialogElement>(null)

  const [avansertSkjemaModus, setAvansertSkjemaModus] =
    React.useState<AvansertBeregningModus>('redigering')
  const [harAvansertSkjemaUnsavedChanges, setHarAvansertSkjemaUnsavedChanges] =
    React.useState<boolean>(false)

  const { data: highchartsAccessibilityFeatureToggle } =
    useGetHighchartsAccessibilityPluginFeatureToggleQuery()
  const { data: detaljertFaneFeatureToggle } =
    useGetDetaljertFaneFeatureToggleQuery()

  React.useEffect(() => {
    /* c8 ignore next 3 */
    if (highchartsAccessibilityFeatureToggle?.enabled) {
      HighchartsAccessibility(Highcharts)
    }
    document.title = intl.formatMessage({
      id: 'application.title.beregning',
    })
  }, [])

  const shouldShowModalBoolean = React.useMemo(() => {
    return (
      harAvansertSkjemaUnsavedChanges ||
      avansertSkjemaModus === 'resultat' ||
      !!(avansertSkjemaModus === 'redigering' && uttaksalder)
    )
  }, [uttaksalder, avansertSkjemaModus, harAvansertSkjemaUnsavedChanges])

  React.useEffect(() => {
    let isEventAdded
    const onPopState = () => {
      logger('modal åpnet', {
        tekst: 'Modal: Er du sikker på at du vil avslutte avansert beregning?',
      })
      avbrytModalRef.current?.showModal()
    }

    if (
      shouldShowModalBoolean &&
      window.location.href.includes(paths.beregningDetaljert)
    ) {
      window.history.pushState(
        null,
        intl.formatMessage({
          id: 'application.title.beregning',
        }),
        window.location.href
      )
      window.addEventListener('popstate', onPopState)
      isEventAdded = true
    } else {
      if (isEventAdded) {
        window.removeEventListener('popstate', onPopState)
        isEventAdded = false
        navigate(-1)
      }
    }

    return () => {
      if (onPopState) {
        window.removeEventListener('popstate', onPopState)
        isEventAdded = false
      }
    }
  }, [shouldShowModalBoolean])

  const navigateToTab = (v: BeregningVisning) => {
    navigate(v === 'enkel' ? paths.beregningEnkel : paths.beregningDetaljert)
    dispatch(userInputActions.flushCurrentSimulation())
    setAvansertSkjemaModus('redigering')
    setHarAvansertSkjemaUnsavedChanges(false)
  }

  const onToggleChange = (v: string) => {
    logger('button klikk', {
      tekst: `Toggle viser fane ${v}`,
    })
    if (
      visning === 'avansert' &&
      v === 'enkel' &&
      (harAvansertSkjemaUnsavedChanges ||
        avansertSkjemaModus === 'resultat' ||
        (avansertSkjemaModus === 'redigering' && uttaksalder))
    ) {
      logger('modal åpnet', {
        tekst: 'Modal: Er du sikker på at du vil avslutte avansert beregning?',
      })
      avbrytModalRef.current?.showModal()
    } else {
      navigateToTab(v as BeregningVisning)
    }
  }

  return (
    <BeregningContext.Provider
      value={{
        avansertSkjemaModus,
        setAvansertSkjemaModus,
        harAvansertSkjemaUnsavedChanges,
        setHarAvansertSkjemaUnsavedChanges,
      }}
    >
      <Modal
        ref={avbrytModalRef}
        header={{
          heading: intl.formatMessage({
            id: 'beregning.avansert.avbryt_modal.title',
          }),
        }}
        width="medium"
        onClose={() => {
          if (window.location.href.includes(paths.beregningDetaljert)) {
            window.history.pushState(
              null,
              intl.formatMessage({
                id: 'application.title.beregning',
              }),
              window.location.href
            )
          }
        }}
      >
        <Modal.Body>
          <BodyLong>
            <FormattedMessage id="beregning.avansert.avbryt_modal.body" />
          </BodyLong>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            onClick={() => {
              navigateToTab('enkel')
              avbrytModalRef.current?.close('returnValue')
            }}
          >
            {intl.formatMessage({
              id: 'beregning.avansert.avbryt_modal.button.avslutt',
            })}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              avbrytModalRef.current?.close()
            }}
          >
            {intl.formatMessage({
              id: 'beregning.avansert.avbryt_modal.button.avbryt',
            })}
          </Button>
        </Modal.Footer>
      </Modal>
      <div className={styles.beregning}>
        {detaljertFaneFeatureToggle?.enabled && (
          <div className={styles.toggle}>
            <div className={styles.container}>
              <ToggleGroup
                value={visning}
                variant="neutral"
                onChange={onToggleChange}
              >
                <ToggleGroup.Item value="enkel">
                  {intl.formatMessage({
                    id: 'beregning.toggle.enkel',
                  })}
                </ToggleGroup.Item>
                <ToggleGroup.Item value="avansert">
                  {intl.formatMessage({
                    id: 'beregning.toggle.avansert',
                  })}
                </ToggleGroup.Item>
              </ToggleGroup>
            </div>
          </div>
        )}
        {visning === 'enkel' && <BeregningEnkel />}
        {visning === 'avansert' && <BeregningAvansert />}
        <div className={`${styles.background} ${styles.background__lightblue}`}>
          <div className={styles.container}>
            <LightBlueFooter />
          </div>
        </div>
      </div>
    </BeregningContext.Provider>
  )
}
