import { compareAsc, parse } from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { PencilIcon, PlusCircleIcon } from '@navikt/aksel-icons'
import {
  BodyShort,
  Button,
  ErrorMessage,
  Heading,
  Modal,
} from '@navikt/ds-react'

import { UtenlandsoppholdModal } from '@/components/UtenlandsoppholdModal'
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
  MODAL_AAPNET,
} from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'

import styles from './UtenlandsoppholdListe.module.scss'

interface Props {
  erVisningIGrunnlag?: boolean
  validationError?: string
}

export function UtenlandsoppholdListe({
  erVisningIGrunnlag,
  validationError,
}: Props) {
  const intl = useIntl()
  const avbrytModalRef = useRef<HTMLDialogElement>(null)
  const utenlandsoppholdModalRef = useRef<HTMLDialogElement>(null)
  const utenlandsperioder = useAppSelector(selectUtenlandsperioder)
  const { uttaksalder } = useAppSelector(selectCurrentSimulation)
  const dispatch = useAppDispatch()
  const [valgtUtenlandsperiodeId, setValgtUtenlandsperiodeId] =
    useState<string>('')

  const locale = getSelectedLanguage()

  const openUtenlandsoppholdModal = () => {
    logger(MODAL_AAPNET, {
      tekst: `Modal: Om oppholdet ditt`,
    })
    utenlandsoppholdModalRef.current?.showModal()
  }

  const onEditClick = (id: string) => {
    setValgtUtenlandsperiodeId(id)
    logger(MODAL_AAPNET, {
      tekst: `Modal: Om oppholdet ditt`,
    })
    utenlandsoppholdModalRef.current?.showModal()
  }

  const onDeleteClick = (id: string) => {
    setValgtUtenlandsperiodeId(id)
    avbrytModalRef.current?.showModal()
  }

  const sortedUtenlandsperioder = useMemo(() => {
    return [...utenlandsperioder].sort((a, b) => {
      // If a has no sluttdato and b has, a comes first
      if (!a.sluttdato) return -1
      if (!b.sluttdato) return 1

      // If both have sluttdato, compare them
      const dateA = parse(a.sluttdato, 'dd.MM.yyyy', new Date())
      const dateB = parse(b.sluttdato, 'dd.MM.yyyy', new Date())

      return compareAsc(dateB, dateA)
    })
  }, [utenlandsperioder])

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
          setValgtUtenlandsperiodeId('')
        }}
      >
        <Modal.Footer>
          <Button
            type="button"
            onClick={() => {
              dispatch(
                userInputActions.deleteUtenlandsperiode(valgtUtenlandsperiodeId)
              )
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
        <BodyShort size="medium" className={styles.bodyshort}>
          <FormattedMessage id="stegvisning.utenlandsopphold.oppholdene.description" />
        </BodyShort>
      )}

      <UtenlandsoppholdModal
        modalRef={utenlandsoppholdModalRef}
        utenlandsperiode={
          valgtUtenlandsperiodeId
            ? utenlandsperioder.find(
                (utenlandsperiode) =>
                  utenlandsperiode.id === valgtUtenlandsperiodeId
              )
            : undefined
        }
        onSubmitCallback={() => {
          setValgtUtenlandsperiodeId('')
        }}
      />
      <dl
        data-testid="utenlandsperiode-liste"
        className={styles.utenlandsperioder}
      >
        {sortedUtenlandsperioder.length > 0 &&
          sortedUtenlandsperioder.map((utenlandsperiode, index) => {
            const harLocalLandKravOmArbeid = harKravOmArbeidFromLandkode(
              utenlandsperiode.landkode
            )
            return (
              <div key={index} className={styles.utenlandsperioderItem}>
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
                  {harLocalLandKravOmArbeid && (
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

                {!erVisningIGrunnlag && (
                  <dd className={styles.utenlandsperioderButtons}>
                    <Button
                      variant="tertiary"
                      size="small"
                      data-testid="endre-utenlandsopphold"
                      icon={<PencilIcon aria-hidden />}
                      className={styles.utenlandsperioderButtons__endre}
                      onClick={() => {
                        onEditClick(utenlandsperiode.id)
                      }}
                    >
                      {intl.formatMessage({
                        id: 'stegvisning.utenlandsopphold.oppholdene.button.endre',
                      })}
                    </Button>

                    <Button
                      variant="tertiary"
                      size="small"
                      data-testid="slett-utenlandsopphold"
                      className={styles.utenlandsperioderButtons__slette}
                      onClick={() => {
                        onDeleteClick(utenlandsperiode.id)
                      }}
                    >
                      {intl.formatMessage({
                        id: 'stegvisning.utenlandsopphold.oppholdene.button.slette',
                      })}
                    </Button>
                  </dd>
                )}
              </div>
            )
          })}
      </dl>

      {!erVisningIGrunnlag && (
        <Button
          data-testid="legg-til-utenlandsopphold"
          type="button"
          variant="secondary"
          icon={<PlusCircleIcon aria-hidden />}
          onClick={openUtenlandsoppholdModal}
        >
          {intl.formatMessage({
            id:
              utenlandsperioder.length > 0
                ? 'stegvisning.utenlandsopphold.oppholdene.button.legg_til_nytt'
                : 'stegvisning.utenlandsopphold.oppholdene.button.legg_til',
          })}
        </Button>
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
