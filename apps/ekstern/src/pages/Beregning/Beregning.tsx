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
import { addSelfDestructingEventListener } from '@/utils/events'

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

  const [showModal, setShowModal] = React.useState<boolean>(false)
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
    let handler: ((e: Event) => void) | undefined
    const onPopState = () => {
      setShowModal(true)
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
      handler = addSelfDestructingEventListener(window, 'popstate', onPopState)
    } else {
      if (handler) {
        window.removeEventListener('popstate', handler)
        navigate(-1)
      }
    }

    return () => {
      if (handler) {
        window.removeEventListener('popstate', handler)
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
    if (
      visning === 'avansert' &&
      v === 'enkel' &&
      (harAvansertSkjemaUnsavedChanges ||
        avansertSkjemaModus === 'resultat' ||
        (avansertSkjemaModus === 'redigering' && uttaksalder))
    ) {
      setShowModal(true)
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
        open={showModal}
        header={{
          heading: intl.formatMessage({
            id: 'beregning.avansert.avbryt_modal.title',
          }),
        }}
        width="medium"
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
              setShowModal(false)
              navigateToTab('enkel')
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
              setShowModal(false)
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
        {visning === 'enkel' && (
          <BeregningEnkel
          // tidligstMuligUttak={
          //   !isTidligstMuligUttakError ? tidligstMuligUttak : undefined
          // }
          />
        )}
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
