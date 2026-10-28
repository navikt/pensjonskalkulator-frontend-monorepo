import { useEffect, useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { PencilIcon, PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons'
import {
  BodyLong,
  BodyShort,
  Button,
  ErrorMessage,
  Heading,
  Modal,
} from '@navikt/ds-react'

import { UtenlandsoppholdSkjema } from '@/components/UtenlandsoppholdSkjema'
import { getSelectedLanguage } from '@/context/LanguageProvider/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectUtenlandsperioder,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import {
  getTranslatedLandFromLandkode,
  harKravOmArbeidFromLandkode,
} from '@/utils/land'
import {
  BUTTON_KLIKK,
  GRUNNLAG_FOR_BEREGNINGEN,
  KNAPP_KLIKKET,
} from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'

import { useSortedUtenlandsperioder } from '../Grunnlag/GrunnlagUtenlandsopphold/hooks'

import styles from './UtenlandsoppholdListe.module.scss'

interface Props {
  erVisningIGrunnlag?: boolean
  validationError?: string
  onSkjemaOpenChange?: (erApent: boolean) => void
}

export function UtenlandsoppholdListe({
  erVisningIGrunnlag,
  validationError,
  onSkjemaOpenChange,
}: Props) {
  const intl = useIntl()
  const avbrytModalRef = useRef<HTMLDialogElement>(null)
  const leggTilNyttOppholdRef = useRef<HTMLButtonElement>(null)
  const skalFokusereLeggTilNyttRef = useRef(false)
  const utenlandsperioder = useAppSelector(selectUtenlandsperioder)
  const { uttaksalder } = useAppSelector(selectCurrentSimulation)
  const dispatch = useAppDispatch()
  const [slettUtenlandsperiodeId, setSlettUtenlandsperiodeId] =
    useState<string>('')
  const [redigerUtenlandsperiodeId, setRedigerUtenlandsperiodeId] =
    useState<string>('')
  const [erLeggTilNyttOppholdAapnet, setErLeggTilNyttOppholdAapnet] =
    useState<boolean>(false)

  const locale = getSelectedLanguage()

  const sortedUtenlandsperioder = useSortedUtenlandsperioder(utenlandsperioder)

  // Når det ikke finnes noen opphold, vises skjemaet for første opphold direkte
  const visSkjemaForNyttOpphold =
    !erVisningIGrunnlag &&
    !redigerUtenlandsperiodeId &&
    (erLeggTilNyttOppholdAapnet || sortedUtenlandsperioder.length === 0)
  const erSkjemaAapent = visSkjemaForNyttOpphold || !!redigerUtenlandsperiodeId

  useEffect(() => {
    onSkjemaOpenChange?.(erSkjemaAapent)
  }, [erSkjemaAapent])

  useEffect(() => {
    if (!erSkjemaAapent && skalFokusereLeggTilNyttRef.current) {
      skalFokusereLeggTilNyttRef.current = false
      leggTilNyttOppholdRef.current?.focus()
    }
  }, [erSkjemaAapent])

  useEffect(() => {
    if (erVisningIGrunnlag) {
      utenlandsperioder.forEach((utenlandsperiode) => {
        logger(GRUNNLAG_FOR_BEREGNINGEN, {
          tekst: 'utenlandsopphold',
          data: utenlandsperiode.landkode,
          valg: utenlandsperiode.arbeidetUtenlands,
        })
      })
    }
  }, [uttaksalder?.aar, uttaksalder?.maaneder, utenlandsperioder])

  const onLeggTilNyttOpphold = () => {
    setRedigerUtenlandsperiodeId('')
    setErLeggTilNyttOppholdAapnet(true)
  }

  const onEditClick = (id: string) => {
    setErLeggTilNyttOppholdAapnet(false)
    setRedigerUtenlandsperiodeId(id)
  }

  const onDeleteClick = (id: string) => {
    setSlettUtenlandsperiodeId(id)
    avbrytModalRef.current?.showModal()
  }

  const onSkjemaClose = () => {
    skalFokusereLeggTilNyttRef.current = true
    setRedigerUtenlandsperiodeId('')
    setErLeggTilNyttOppholdAapnet(false)
  }

  const getPeriodeBeskrivelse = (utenlandsperiode: Utenlandsperiode) => {
    const periode = utenlandsperiode.sluttdato
      ? `${utenlandsperiode.startdato}–${utenlandsperiode.sluttdato}`
      : utenlandsperiode.startdato
    const erVarig = !utenlandsperiode.sluttdato
    const harJobbet = utenlandsperiode.arbeidetUtenlands

    if (!erVarig && !harJobbet) {
      return periode
    }
    const suffixId = erVarig
      ? harJobbet
        ? 'stegvisning.utenlandsopphold.oppholdene.periode.varig_jobbet'
        : 'stegvisning.utenlandsopphold.oppholdene.description.periode.varig_opphold'
      : 'stegvisning.utenlandsopphold.oppholdene.periode.jobbet'
    return `${periode} ${intl.formatMessage({ id: suffixId })}`
  }

  return (
    <section className={styles.section}>
      <Modal
        ref={avbrytModalRef}
        header={{
          heading: intl.formatMessage({
            id: 'utenlandsopphold.slette_modal.title',
          }),
        }}
        width="medium"
        onClose={() => {
          setSlettUtenlandsperiodeId('')
        }}
      >
        <Modal.Footer>
          <Button
            type="button"
            onClick={() => {
              dispatch(
                userInputActions.deleteUtenlandsperiode(slettUtenlandsperiodeId)
              )
              if (slettUtenlandsperiodeId === redigerUtenlandsperiodeId) {
                setRedigerUtenlandsperiodeId('')
              }
              logger(KNAPP_KLIKKET, {
                tekst: `sletter utenlandsopphold`,
              })
              logger(BUTTON_KLIKK, {
                tekst: `sletter utenlandsopphold`,
              })
              avbrytModalRef.current?.close()
            }}
          >
            {intl.formatMessage({
              id: 'utenlandsopphold.slette_modal.button.slett',
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
              id: 'utenlandsopphold.slette_modal.button.avbryt',
            })}
          </Button>
        </Modal.Footer>
      </Modal>

      <Heading size="small" level="3">
        <FormattedMessage id="stegvisning.utenlandsopphold.oppholdene.title" />
      </Heading>

      {!erVisningIGrunnlag && (
        <BodyLong size="medium" className={styles.bodylong}>
          <FormattedMessage id="stegvisning.utenlandsopphold.oppholdene.description" />
        </BodyLong>
      )}

      {erVisningIGrunnlag ? (
        <dl
          data-testid="utenlandsperiode-liste"
          className={styles.utenlandsperioder}
        >
          {sortedUtenlandsperioder.map((utenlandsperiode) => (
            <div
              key={utenlandsperiode.id}
              className={styles.utenlandsperioderItem}
            >
              <div className={styles.utenlandsperioderText}>
                <dd>
                  <b>
                    {getTranslatedLandFromLandkode(
                      utenlandsperiode.landkode,
                      locale
                    )}
                  </b>
                </dd>
                <dd>
                  <FormattedMessage id="stegvisning.utenlandsopphold.oppholdene.description.periode" />
                  {utenlandsperiode.startdato}
                  {utenlandsperiode.sluttdato
                    ? `–${utenlandsperiode.sluttdato}`
                    : ` ${intl.formatMessage({ id: 'stegvisning.utenlandsopphold.oppholdene.description.periode.varig_opphold' })}`}
                </dd>
                {harKravOmArbeidFromLandkode(utenlandsperiode.landkode) && (
                  <dd>
                    <FormattedMessage id="stegvisning.utenlandsopphold.oppholdene.description.har_jobbet" />
                    <FormattedMessage
                      id={
                        utenlandsperiode.arbeidetUtenlands
                          ? 'stegvisning.utenlandsopphold.oppholdene.description.har_jobbet.ja'
                          : 'stegvisning.utenlandsopphold.oppholdene.description.har_jobbet.nei'
                      }
                    />
                  </dd>
                )}
              </div>
            </div>
          ))}
        </dl>
      ) : (
        <>
          {sortedUtenlandsperioder.length > 0 && (
            <ul data-testid="utenlandsperiode-liste" className={styles.liste}>
              {sortedUtenlandsperioder.map((utenlandsperiode) => {
                const landnavn = getTranslatedLandFromLandkode(
                  utenlandsperiode.landkode,
                  locale
                )

                if (utenlandsperiode.id === redigerUtenlandsperiodeId) {
                  return (
                    <li key={utenlandsperiode.id} className={styles.listeItem}>
                      <UtenlandsoppholdSkjema
                        utenlandsperiode={utenlandsperiode}
                        autoFocus
                        onSubmitCallback={onSkjemaClose}
                      />
                    </li>
                  )
                }

                return (
                  <li key={utenlandsperiode.id} className={styles.listeItem}>
                    <div className={styles.listeItemInnhold}>
                      <BodyShort weight="semibold">{landnavn}</BodyShort>
                      <BodyShort>
                        {getPeriodeBeskrivelse(utenlandsperiode)}
                      </BodyShort>
                    </div>
                    <div className={styles.listeItemKnapper}>
                      <Button
                        type="button"
                        variant="tertiary"
                        size="small"
                        data-testid="endre-utenlandsopphold"
                        icon={<PencilIcon aria-hidden />}
                        aria-label={intl.formatMessage(
                          {
                            id: 'stegvisning.utenlandsopphold.oppholdene.button.endre.aria_label',
                          },
                          { land: landnavn }
                        )}
                        onClick={() => {
                          onEditClick(utenlandsperiode.id)
                        }}
                      >
                        {intl.formatMessage({
                          id: 'stegvisning.utenlandsopphold.oppholdene.button.endre',
                        })}
                      </Button>
                      <Button
                        type="button"
                        variant="tertiary"
                        size="small"
                        data-testid="slett-utenlandsopphold"
                        icon={<TrashIcon aria-hidden />}
                        aria-label={intl.formatMessage(
                          {
                            id: 'stegvisning.utenlandsopphold.oppholdene.button.slette.aria_label',
                          },
                          { land: landnavn }
                        )}
                        onClick={() => {
                          onDeleteClick(utenlandsperiode.id)
                        }}
                      >
                        {intl.formatMessage({
                          id: 'stegvisning.utenlandsopphold.oppholdene.button.slette',
                        })}
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {visSkjemaForNyttOpphold && (
            <div className={styles.nyttOppholdSkjema}>
              <UtenlandsoppholdSkjema
                autoFocus={erLeggTilNyttOppholdAapnet}
                showCancelButton={sortedUtenlandsperioder.length > 0}
                onSubmitCallback={onSkjemaClose}
              />
            </div>
          )}

          {!erSkjemaAapent && (
            <Button
              ref={leggTilNyttOppholdRef}
              data-testid="legg-til-utenlandsopphold"
              type="button"
              variant="secondary"
              icon={<PlusCircleIcon aria-hidden />}
              onClick={onLeggTilNyttOpphold}
            >
              {intl.formatMessage({
                id: 'stegvisning.utenlandsopphold.oppholdene.button.legg_til_nytt',
              })}
            </Button>
          )}
        </>
      )}

      {validationError && (
        <ErrorMessage
          showIcon
          className={styles.error}
          role="alert"
          aria-live="polite"
        >
          {validationError}
        </ErrorMessage>
      )}
    </section>
  )
}
