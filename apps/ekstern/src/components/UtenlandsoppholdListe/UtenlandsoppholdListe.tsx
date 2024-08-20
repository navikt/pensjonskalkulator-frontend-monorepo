import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { PencilIcon, PlusCircleIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Heading } from '@navikt/ds-react'
import { parse, compareAsc } from 'date-fns'

import { UtenlandsoppholdModal } from '@/components/UtenlandsoppholdModal'
import { getSelectedLanguage } from '@/context/LanguageProvider/utils'
import { useAppSelector, useAppDispatch } from '@/state/hooks'
import { selectCurrentSimulationUtenlandsperioder } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { getTranslatedLandFromLandkode } from '@/utils/land'
import { logger } from '@/utils/logging'

import styles from './UtenlandsoppholdListe.module.scss'

interface Props {
  validationError?: string
}

export function UtenlandsoppholdListe({ validationError }: Props) {
  const intl = useIntl()
  const utenlandsoppholdModalRef = React.useRef<HTMLDialogElement>(null)
  const utenlandsperioder = useAppSelector(
    selectCurrentSimulationUtenlandsperioder
  )
  const dispatch = useAppDispatch()
  const [valgtUtenlandsperiodeId, setValgtUtenlandsperiodeId] =
    React.useState<string>('')

  const locale = getSelectedLanguage()

  const openUtenlandsoppholdModal = () => {
    logger('modal åpnet', {
      tekst: `Modal: Om oppholdet ditt`,
    })
    utenlandsoppholdModalRef.current?.showModal()
  }

  const onEditClick = (id: string) => {
    setValgtUtenlandsperiodeId(id)
    utenlandsoppholdModalRef.current?.showModal()
  }

  const onDeleteClick = (id: string) => {
    dispatch(userInputActions.deleteCurrentSimulationUtenlandsperiode(id))
  }

  // TODO skrive tester
  const sortedUtenlandsperioder = React.useMemo(() => {
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

  return (
    <section className={styles.section}>
      <Heading size="small" level="3">
        <FormattedMessage id="stegvisning.utenlandsopphold.oppholdene.title" />
      </Heading>
      <BodyShort size="medium" className={styles.bodyshort}>
        <FormattedMessage id="stegvisning.utenlandsopphold.oppholdene.description" />
      </BodyShort>
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
      <dl className={styles.utenlandsperioder}>
        {sortedUtenlandsperioder.length > 0 &&
          sortedUtenlandsperioder.map((utenlandsperiode, index) => {
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
                    {utenlandsperiode.startdato}–
                    {utenlandsperiode.sluttdato ? (
                      utenlandsperiode.sluttdato
                    ) : (
                      <FormattedMessage id="stegvisning.utenlandsopphold.oppholdene.description.periode.naa" />
                    )}
                  </dd>
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
                </div>

                <dd className={styles.utenlandsperioderButtons}>
                  <Button
                    variant="tertiary"
                    size="small"
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
              </div>
            )
          })}
      </dl>
      <Button
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
      {validationError && (
        <BodyShort
          size="medium"
          className={`navds-error-message navds-label ${styles.error}`}
        >
          {validationError}
        </BodyShort>
      )}
    </section>
  )
}
