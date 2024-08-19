import React from 'react'
import { FormEvent, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { PlusCircleIcon, PencilIcon, TrashIcon } from '@navikt/aksel-icons'
import {
  BodyLong,
  BodyShort,
  Button,
  Heading,
  Radio,
  RadioGroup,
} from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { ReadMore } from '@/components/common/ReadMore'
import { UtenlandsoppholdModal } from '@/components/UtenlandsoppholdModal'
import { getSelectedLanguage } from '@/context/LanguageProvider/utils'
import { useAppSelector } from '@/state/hooks'
import { useAppDispatch } from '@/state/hooks'
import { selectCurrentSimulationUtenlandsperioder } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { getTranslatedLandFromLandkode } from '@/utils/land'
import { logger, wrapLogger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './Utenlandsopphold.module.scss'

interface Props {
  harUtenlandsopphold: boolean | null
  onCancel?: () => void
  onPrevious: () => void
  onNext: (utenlandsoppholdData: BooleanRadio) => void
}

export function Utenlandsopphold({
  harUtenlandsopphold,
  onCancel,
  onPrevious,
  onNext,
}: Props) {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const utenlandsperioder = useAppSelector(
    selectCurrentSimulationUtenlandsperioder
  )
  const utenlandsoppholdModalRef = React.useRef<HTMLDialogElement>(null)
  const [validationError, setValidationError] = useState<string>('')
  const [bottomValidationError, setBottomValidationError] = useState<string>('')
  const [valgtUtenlandsperiodeId, setValgtUtenlandsperiodeId] =
    React.useState<string>('')
  const [showUtenlandsperioder, setShowUtenlandsperioder] =
    React.useState<boolean>(!!harUtenlandsopphold)
  const locale = getSelectedLanguage()
  const openUtenlandsoppholdModal = () => {
    logger('modal åpnet', {
      tekst: `Modal: Om oppholdet ditt`,
    })
    utenlandsoppholdModalRef.current?.showModal()
  }

  // TODO legge til test
  React.useEffect(() => {
    if (bottomValidationError && utenlandsperioder.length > 0) {
      setBottomValidationError('')
    }
  }, [utenlandsperioder])

  // TODO skrive test
  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const utenlandsoppholdData = data.get('har-utenlandsopphold-radio') as
      | BooleanRadio
      | undefined
    if (!utenlandsoppholdData) {
      const tekst = intl.formatMessage({
        id: 'stegvisning.utenlandsopphold.validation_error',
      })
      setValidationError(tekst)
      logger('valideringsfeil', {
        data: intl.formatMessage({
          id: 'stegvisning.utenlandsopphold.radio_label',
        }),
        tekst,
      })
    } else if (
      utenlandsoppholdData === 'ja' &&
      utenlandsperioder.length === 0
    ) {
      const tekst = intl.formatMessage({
        id: 'stegvisning.utenlandsopphold.mangler_opphold.validation_error',
      })
      setBottomValidationError(tekst)
      logger('valideringsfeil', {
        data: intl.formatMessage({
          id: 'stegvisning.utenlandsopphold.radio_label',
        }),
        tekst,
      })
    } else {
      logger('radiogroup valgt', {
        tekst: 'Utenlandsopphold',
        valg: utenlandsoppholdData,
      })
      logger('button klikk', {
        tekst: 'Neste',
      })
      onNext(utenlandsoppholdData)
    }
  }

  const handleRadioChange = (value: BooleanRadio): void => {
    setShowUtenlandsperioder(value === 'ja')
    setValidationError('')
    setBottomValidationError('')
  }

  return (
    <Card hasLargePadding hasMargin>
      <form id="har-utenlandsopphold" onSubmit={onSubmit}></form>
      <Heading level="2" size="medium" spacing>
        <FormattedMessage id="stegvisning.utenlandsopphold.title" />
      </Heading>
      <BodyLong size="large">
        <FormattedMessage id="stegvisning.utenlandsopphold.ingress" />
      </BodyLong>
      <ReadMore
        name="Hva som er opphold utenfor Norge"
        className={styles.readmore1}
        header={
          <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.title" />
        }
      >
        <FormattedMessage
          id="stegvisning.utenlandsopphold.readmore_1.opphold.subtitle"
          values={{
            ...getFormatMessageValues(intl),
          }}
        />
        <ul>
          <li>
            <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.opphold.list_item1" />
          </li>
          <li>
            <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.opphold.list_item2" />
          </li>
        </ul>
        <FormattedMessage
          id="stegvisning.utenlandsopphold.readmore_1.ikke_opphold.subtitle"
          values={{
            ...getFormatMessageValues(intl),
          }}
        />
        <ul>
          <li>
            <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.ikke_opphold.list_item1" />
          </li>
          <li>
            <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.ikke_opphold.list_item2" />
          </li>
          <li>
            <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.ikke_opphold.list_item3" />
          </li>
          <li>
            <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.ikke_opphold.list_item4" />
          </li>
          <li>
            <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.ikke_opphold.list_item5" />
          </li>
          <li>
            <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.ikke_opphold.list_item6" />
          </li>
        </ul>
        <FormattedMessage
          id="stegvisning.utenlandsopphold.readmore_1.ingress"
          values={{
            ...getFormatMessageValues(intl),
          }}
        />
      </ReadMore>
      <ReadMore
        name="Betydning av opphold utenfor Norge for pensjon"
        className={styles.readmore2}
        header={
          <FormattedMessage id="stegvisning.utenlandsopphold.readmore_2.title" />
        }
      >
        <FormattedMessage
          id="stegvisning.utenlandsopphold.readmore_2.ingress"
          values={{
            ...getFormatMessageValues(intl),
          }}
        />
      </ReadMore>
      <RadioGroup
        name="har-utenlandsopphold-radio"
        className={styles.radiogroup}
        legend={
          <FormattedMessage id="stegvisning.utenlandsopphold.radio_label" />
        }
        description={
          <FormattedMessage id="stegvisning.utenlandsopphold.radio_label.description" />
        }
        defaultValue={
          harUtenlandsopphold
            ? 'ja'
            : harUtenlandsopphold === false
              ? 'nei'
              : null
        }
        onChange={handleRadioChange}
        error={validationError}
        role="radiogroup"
        aria-required="true"
      >
        <Radio form="har-utenlandsopphold" value="ja">
          <FormattedMessage id="stegvisning.utenlandsopphold.radio_ja" />
        </Radio>
        <Radio form="har-utenlandsopphold" value="nei">
          <FormattedMessage id="stegvisning.utenlandsopphold.radio_nei" />
        </Radio>
      </RadioGroup>

      {
        //  TODO skrive tester for å dekke visning av utenlandsperioder
      }
      {showUtenlandsperioder && (
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
            {utenlandsperioder.length > 0 &&
              utenlandsperioder.map((utenlandsperiode, index) => {
                return (
                  <div key={index} className={styles.utenlandsperioder__item}>
                    <dd>
                      <b>
                        {getTranslatedLandFromLandkode(
                          utenlandsperiode.landkode,
                          locale
                        )}
                      </b>
                    </dd>
                    <dd>
                      Periode: {utenlandsperiode.startdato} -
                      {utenlandsperiode.sluttdato}
                    </dd>
                    <dd>
                      Jobbet:{' '}
                      {utenlandsperiode.arbeidetUtenlands ? 'Ja' : 'Nei'}
                    </dd>
                    <dd>
                      <Button
                        variant="tertiary"
                        size="small"
                        icon={<PencilIcon aria-hidden />}
                        onClick={() => {
                          setValgtUtenlandsperiodeId(utenlandsperiode.id)
                          utenlandsoppholdModalRef.current?.showModal()
                        }}
                      >
                        {intl.formatMessage({
                          id: 'stegvisning.utenlandsopphold.oppholdene.button.endre',
                        })}
                      </Button>
                      <Button
                        variant="tertiary"
                        size="small"
                        icon={<TrashIcon aria-hidden />}
                        onClick={() => {
                          dispatch(
                            userInputActions.deleteCurrentSimulationUtenlandsperiode(
                              utenlandsperiode.id
                            )
                          )
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
              id: 'stegvisning.utenlandsopphold.oppholdene.button.legg_til',
            })}
          </Button>

          {bottomValidationError && (
            <>
              <BodyShort
                size="medium"
                className={`navds-error-message navds-label ${styles.error}`}
              >
                {bottomValidationError}
              </BodyShort>
            </>
          )}
        </section>
      )}

      <Button
        form="har-utenlandsopphold"
        type="submit"
        className={styles.button}
      >
        <FormattedMessage id="stegvisning.neste" />
      </Button>
      <Button
        type="button"
        className={styles.button}
        variant="secondary"
        onClick={wrapLogger('button klikk', { tekst: 'Tilbake' })(onPrevious)}
      >
        <FormattedMessage id="stegvisning.tilbake" />
      </Button>
      {onCancel && (
        <Button
          type="button"
          className={styles.button}
          variant="tertiary"
          onClick={wrapLogger('button klikk', { tekst: 'Avbryt' })(onCancel)}
        >
          <FormattedMessage id="stegvisning.avbryt" />
        </Button>
      )}
    </Card>
  )
}
