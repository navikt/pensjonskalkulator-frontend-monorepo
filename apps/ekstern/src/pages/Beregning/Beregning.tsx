import clsx from 'clsx'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { DownloadIcon } from '@navikt/aksel-icons'
import { BodyLong, Button, Modal, ToggleGroup } from '@navikt/ds-react'

import { InfoOmFremtidigVedtak } from '@/components/InfoOmFremtidigVedtak'
import { LightBlueFooter } from '@/components/LightBlueFooter'
import { ApotekereWarning } from '@/components/common/ApotekereWarning/ApotekereWarning'
import { ShowMoreRef } from '@/components/common/ShowMore/ShowMore'
import { paths } from '@/router/constants'
import { useGetShowDownloadPdfFeatureToggleQuery } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectHasErApotekerError } from '@/state/session/selectors'
import {
  selectAfp,
  selectCurrentSimulation,
  selectFoedselsdato,
  selectIsEndring,
  selectLoependeVedtak,
  selectSkalBeregneAfpKap19,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { BeregningVisning } from '@/types/common-types'
import { isFoedtEtter1963 } from '@/utils/alder'
import {
  BUTTON_KLIKK,
  KNAPP_KLIKKET,
  MODAL_AAPNET,
} from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'

import { BeregningAvansert } from './BeregningAvansert'
import { BeregningEnkel } from './BeregningEnkel'
import { AvansertBeregningModus, BeregningContext, ShowPDFRef } from './context'

import styles from './Beregning.module.scss'

interface Props {
  visning: BeregningVisning
}

export const Beregning: React.FC<Props> = ({ visning }) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const APPLICATION_TITLE_BEREGNING = 'application.title.beregning'

  const { uttaksalder } = useAppSelector(selectCurrentSimulation)
  const avbrytModalRef = React.useRef<HTMLDialogElement>(null)

  const [avansertSkjemaModus, setAvansertSkjemaModus] =
    React.useState<AvansertBeregningModus>('redigering')
  const [harAvansertSkjemaUnsavedChanges, setHarAvansertSkjemaUnsavedChanges] =
    React.useState<boolean>(false)
  const [isPdfReady, setIsPdfReady] = React.useState(false)

  const isEndring = useAppSelector(selectIsEndring)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
  const skalBeregneAfpKap19 = useAppSelector(selectSkalBeregneAfpKap19)
  const afp = useAppSelector(selectAfp)
  const foedselsdato = useAppSelector(selectFoedselsdato)
  const foedtEtter1963 = isFoedtEtter1963(foedselsdato)
  const hasErApotekerError = useAppSelector(selectHasErApotekerError)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: APPLICATION_TITLE_BEREGNING,
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
      // TODO: fjern når amplitude er ikke i bruk lenger
      logger(MODAL_AAPNET, {
        tekst: 'Modal: Er du sikker på at du vil avslutte avansert beregning?',
      })
      logger(MODAL_AAPNET, {
        modalId: 'bekreftelses-modal',
        tittel: 'Modal: Er du sikker på at du vil avslutte avansert beregning?',
      })
      avbrytModalRef.current?.showModal()
    }

    if (window.location.href.includes(paths.beregningAvansert)) {
      if (shouldShowModalBoolean) {
        window.history.pushState(
          null,
          intl.formatMessage({
            id: APPLICATION_TITLE_BEREGNING,
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
    logger(KNAPP_KLIKKET, {
      tekst: `Toggle viser fane ${v}`,
    })
    logger(BUTTON_KLIKK, {
      tekst: `Toggle viser fane ${v}`,
    })
    if (
      visning === 'avansert' &&
      v === 'enkel' &&
      (harAvansertSkjemaUnsavedChanges ||
        avansertSkjemaModus === 'resultat' ||
        (avansertSkjemaModus === 'redigering' && uttaksalder))
    ) {
      // TODO: fjern når amplitude er ikke i bruk lenger
      logger(MODAL_AAPNET, {
        tekst: 'Modal: Er du sikker på at du vil avslutte avansert beregning?',
      })
      logger(MODAL_AAPNET, {
        modalId: 'bekreftelses-modal',
        tittel: 'Modal: Er du sikker på at du vil avslutte avansert beregning?',
      })
      avbrytModalRef.current?.showModal()
    } else {
      navigateToTab(v as BeregningVisning)
    }
  }

  const pensjonsavtalerShowMoreRef = React.useRef<ShowMoreRef>(null)
  const showPDFRef = React.useRef<ShowPDFRef>(null)
  const { data: showPDF } = useGetShowDownloadPdfFeatureToggleQuery()
  return (
    <BeregningContext.Provider
      value={{
        avansertSkjemaModus,
        setAvansertSkjemaModus,
        harAvansertSkjemaUnsavedChanges,
        setHarAvansertSkjemaUnsavedChanges,
        pensjonsavtalerShowMoreRef,
        showPDFRef,
        setIsPdfReady,
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
                id: APPLICATION_TITLE_BEREGNING,
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

        <div className={styles.container}>
          <div className={styles.alert}>
            <ApotekereWarning
              showWarning={Boolean(
                afp === 'ja_offentlig' && hasErApotekerError && foedtEtter1963
              )}
            />
          </div>
        </div>

        {!isEndring && !skalBeregneAfpKap19 && (
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

        {isPdfReady && showPDF?.enabled && (
          <div className={styles.container}>
            <section className={styles.section}>
              <BodyLong size="medium" className={styles.text}>
                {intl.formatMessage({ id: 'beregning.pdf.ingress' })}
              </BodyLong>
              <Button
                variant="secondary"
                icon={<DownloadIcon aria-hidden />}
                onClick={() => {
                  showPDFRef.current?.handlePDF()
                }}
              >
                <FormattedMessage id="beregning.pdf.button" />
              </Button>
            </section>
          </div>
        )}

        <div className={clsx(styles.background, styles.background__lightblue)}>
          <div className={styles.container}>
            <LightBlueFooter />
          </div>
        </div>
      </div>
    </BeregningContext.Provider>
  )
}
