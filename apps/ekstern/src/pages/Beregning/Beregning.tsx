import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, Modal, ToggleGroup } from '@navikt/ds-react'
import clsx from 'clsx'

import { ShowMoreRef } from '@/components/common/ShowMore/ShowMore'
import { InfoOmFremtidigVedtak } from '@/components/InfoOmFremtidigVedtak'
import { LightBlueFooter } from '@/components/LightBlueFooter'
import { paths } from '@/router/constants'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectIsEndring,
  selectLoependeVedtak,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { BeregningVisning } from '@/types/common-types'
import { logger } from '@/utils/logging'

import { BeregningAvansert } from './BeregningAvansert'
import { BeregningEnkel } from './BeregningEnkel'
import { BeregningContext, AvansertBeregningModus } from './context'

import styles from './Beregning.module.scss'

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

  const isEndring = useAppSelector(selectIsEndring)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)

  React.useEffect(() => {
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

    if (window.location.href.includes(paths.beregningAvansert)) {
      if (shouldShowModalBoolean) {
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
        window.removeEventListener('popstate', onPopState)
        if (isEventAdded) {
          isEventAdded = false
          navigate(-1)
        }
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
    navigate(v === 'enkel' ? paths.beregningEnkel : paths.beregningAvansert)
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

  const pensjonsavtalerShowMoreRef = React.useRef<ShowMoreRef>(null)

  return (
    <BeregningContext.Provider
      value={{
        avansertSkjemaModus,
        setAvansertSkjemaModus,
        harAvansertSkjemaUnsavedChanges,
        setHarAvansertSkjemaUnsavedChanges,
        pensjonsavtalerShowMoreRef,
      }}
    >
      <Modal
        ref={avbrytModalRef}
        header={{
          heading: intl.formatMessage({
            id: isEndring
              ? 'beregning.avansert.avbryt_modal.endring.title'
              : 'beregning.avansert.avbryt_modal.title',
          }),
        }}
        width="medium"
        onClose={() => {
          if (window.location.href.includes(paths.beregningAvansert)) {
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
        <Modal.Footer>
          <Button
            type="button"
            onClick={() => {
              if (isEndring) {
                dispatch(userInputActions.flushCurrentSimulation())
                navigate(paths.start)
              } else {
                navigateToTab('enkel')
              }

              avbrytModalRef.current?.close('returnValue')
            }}
          >
            {intl.formatMessage({
              id: isEndring
                ? 'beregning.avansert.avbryt_modal.endring.button.avslutt'
                : 'beregning.avansert.avbryt_modal.button.avslutt',
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
        <div className={styles.container}>
          <InfoOmFremtidigVedtak loependeVedtak={loependeVedtak} />
        </div>

        {!isEndring && (
          <div className={styles.toggle}>
            <div className={styles.container} data-testid="toggle-avansert">
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

        <div className={clsx(styles.background, styles.background__lightblue)}>
          <div className={styles.container}>
            <LightBlueFooter />
          </div>
        </div>
      </div>
    </BeregningContext.Provider>
  )
}
