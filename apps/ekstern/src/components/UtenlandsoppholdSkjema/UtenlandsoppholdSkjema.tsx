import { format } from 'date-fns'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Button,
  UNSAFE_Combobox as Combobox,
  DatePicker,
  HStack,
  Radio,
  RadioGroup,
  VStack,
} from '@navikt/ds-react'

import { getSelectedLanguage } from '@/context/LanguageProvider/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectFoedselsdato,
  selectUtenlandsperioder,
} from '@/state/userInput/selectors'
import { DATE_ENDUSER_FORMAT } from '@/utils/dates'
import { getTranslatedLand, getTranslatedLandFromLandkode } from '@/utils/land'
import { getFormatMessageValues } from '@/utils/translations'

import landListeData from '../../assets/land-liste.json' with { type: 'json' }
import { useUtenlandsoppholdLocalState } from './hooks'
import { UTENLANDSOPPHOLD_FORM_NAMES, onUtenlandsoppholdSubmit } from './utils'

import styles from './UtenlandsoppholdSkjema.module.scss'

const OPPHOLD_VARIG_DESCRIPTION =
  'stegvisning.utenlandsopphold.oppholdene.description.periode.varig_opphold'

interface Props {
  utenlandsperiode?: Utenlandsperiode
  showCancelButton?: boolean
  autoFocus?: boolean
  onSubmitCallback: () => void
}

export const UtenlandsoppholdSkjema: React.FC<Props> = ({
  utenlandsperiode,
  showCancelButton = true,
  autoFocus = false,
  onSubmitCallback,
}) => {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const locale = getSelectedLanguage()
  const landInputRef = React.useRef<HTMLInputElement>(null)

  const foedselsdato = useAppSelector(selectFoedselsdato)
  const utenlandsperioder = useAppSelector(selectUtenlandsperioder)

  const [
    localUtenlandsperiode,
    harLocalLandKravOmArbeid,
    datepickerStartdato,
    datepickerSluttdato,
    validationErrors,
    maxDate,
    {
      setValidationErrors,
      handleLandChange,
      handleArbeidetUtenlandsChange,
      onCancel,
    },
  ] = useUtenlandsoppholdLocalState({
    foedselsdato,
    utenlandsperiode,
    onSubmitCallback,
  })

  React.useEffect(() => {
    if (autoFocus) {
      landInputRef.current?.focus()
    }
  }, [])

  const landOptions = React.useMemo(
    () =>
      landListeData.map((land) => ({
        label: getTranslatedLand(land, locale),
        value: land.landkode,
      })),
    [locale]
  )
  const selectedLandOptions = landOptions.filter(
    (option) => option.value === localUtenlandsperiode?.landkode
  )

  const getOverlappValues = () => ({
    land: validationErrors[UTENLANDSOPPHOLD_FORM_NAMES.overlappende_land],
    periodestart:
      validationErrors[UTENLANDSOPPHOLD_FORM_NAMES.overlappende_periodestart],
    periodeslutt: validationErrors[
      UTENLANDSOPPHOLD_FORM_NAMES.overlappende_periodeslutt
    ]
      ? validationErrors[UTENLANDSOPPHOLD_FORM_NAMES.overlappende_periodeslutt]
      : intl.formatMessage({ id: OPPHOLD_VARIG_DESCRIPTION }),
  })

  return (
    <form
      id={UTENLANDSOPPHOLD_FORM_NAMES.form}
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation()
        const data = new FormData(e.currentTarget)
        onUtenlandsoppholdSubmit(
          data,
          dispatch,
          setValidationErrors,
          onSubmitCallback,
          locale,
          {
            foedselsdato,
            utenlandsperiodeId: localUtenlandsperiode.id,
            utenlandsperioder,
          }
        )
      }}
    >
      <VStack gap="space-24">
        <input
          type="hidden"
          form={UTENLANDSOPPHOLD_FORM_NAMES.form}
          name={UTENLANDSOPPHOLD_FORM_NAMES.land}
          value={localUtenlandsperiode?.landkode ?? ''}
        />
        <Combobox
          ref={landInputRef}
          data-testid={UTENLANDSOPPHOLD_FORM_NAMES.land}
          className={styles.select}
          label={intl.formatMessage({
            id: 'utenlandsopphold.om_oppholdet_ditt_modal.land.label',
          })}
          options={landOptions}
          selectedOptions={selectedLandOptions}
          onToggleSelected={(landkode, isSelected) =>
            handleLandChange(isSelected ? landkode : '')
          }
          error={
            validationErrors[UTENLANDSOPPHOLD_FORM_NAMES.land]
              ? intl.formatMessage(
                  { id: validationErrors[UTENLANDSOPPHOLD_FORM_NAMES.land] },
                  { ...getFormatMessageValues(), ...getOverlappValues() }
                )
              : ''
          }
        />
        {localUtenlandsperiode?.landkode && (
          <>
            {harLocalLandKravOmArbeid && (
              <RadioGroup
                key={localUtenlandsperiode.landkode}
                form={UTENLANDSOPPHOLD_FORM_NAMES.form}
                id={UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands}
                name={UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands}
                data-testid={UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands}
                legend={
                  <FormattedMessage
                    id="utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.label"
                    values={{
                      land: getTranslatedLandFromLandkode(
                        localUtenlandsperiode.landkode,
                        locale
                      ),
                    }}
                  />
                }
                description={
                  <FormattedMessage id="utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.description" />
                }
                defaultValue={
                  localUtenlandsperiode.arbeidetUtenlands
                    ? 'ja'
                    : localUtenlandsperiode.arbeidetUtenlands === false
                      ? 'nei'
                      : null
                }
                onChange={handleArbeidetUtenlandsChange}
                error={
                  validationErrors[
                    UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands
                  ]
                    ? intl.formatMessage(
                        {
                          id: validationErrors[
                            UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands
                          ],
                        },
                        { ...getFormatMessageValues(), ...getOverlappValues() }
                      )
                    : ''
                }
              >
                <Radio
                  value="ja"
                  data-testid={`${UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands}-ja`}
                >
                  <FormattedMessage id="utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.radio_ja" />
                </Radio>
                <Radio
                  value="nei"
                  data-testid={`${UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands}-nei`}
                >
                  <FormattedMessage id="utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.radio_nei" />
                </Radio>
              </RadioGroup>
            )}
            <DatePicker
              {...datepickerStartdato.datepickerProps}
              dropdownCaption
            >
              <DatePicker.Input
                {...datepickerStartdato.inputProps}
                className={styles.datepicker}
                form={UTENLANDSOPPHOLD_FORM_NAMES.form}
                name={UTENLANDSOPPHOLD_FORM_NAMES.startdato}
                data-testid={UTENLANDSOPPHOLD_FORM_NAMES.startdato}
                label={intl.formatMessage({
                  id: 'utenlandsopphold.om_oppholdet_ditt_modal.startdato.label',
                })}
                description={intl.formatMessage({
                  id: 'utenlandsopphold.om_oppholdet_ditt_modal.startdato.description',
                })}
                error={
                  validationErrors[UTENLANDSOPPHOLD_FORM_NAMES.startdato]
                    ? intl.formatMessage(
                        {
                          id: validationErrors[
                            UTENLANDSOPPHOLD_FORM_NAMES.startdato
                          ],
                        },
                        {
                          ...getFormatMessageValues(),
                          ...getOverlappValues(),
                          maxDato: format(maxDate, DATE_ENDUSER_FORMAT),
                        }
                      )
                    : ''
                }
              />
            </DatePicker>
            <DatePicker
              {...datepickerSluttdato.datepickerProps}
              dropdownCaption
            >
              <DatePicker.Input
                {...datepickerSluttdato.inputProps}
                className={styles.datepicker}
                form={UTENLANDSOPPHOLD_FORM_NAMES.form}
                name={UTENLANDSOPPHOLD_FORM_NAMES.sluttdato}
                data-testid={UTENLANDSOPPHOLD_FORM_NAMES.sluttdato}
                label={intl.formatMessage({
                  id: 'utenlandsopphold.om_oppholdet_ditt_modal.sluttdato.label',
                })}
                description={intl.formatMessage({
                  id: 'utenlandsopphold.om_oppholdet_ditt_modal.sluttdato.description',
                })}
                error={
                  validationErrors[UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]
                    ? intl.formatMessage(
                        {
                          id: validationErrors[
                            UTENLANDSOPPHOLD_FORM_NAMES.sluttdato
                          ],
                        },
                        {
                          ...getFormatMessageValues(),
                          maxDato: format(maxDate, DATE_ENDUSER_FORMAT),
                        }
                      )
                    : ''
                }
              />
            </DatePicker>
          </>
        )}
        <HStack gap="space-16">
          <Button
            type="submit"
            variant="secondary"
            data-testid="legg-til-utenlandsopphold-submit"
          >
            {intl.formatMessage({
              id: utenlandsperiode
                ? 'utenlandsopphold.om_oppholdet_ditt_modal.button.oppdater'
                : 'utenlandsopphold.om_oppholdet_ditt_modal.button.legg_til',
            })}
          </Button>
          {showCancelButton && (
            <Button
              type="button"
              variant="tertiary"
              onClick={onCancel}
              data-testid="legg-til-utenlandsopphold-avbryt"
            >
              {intl.formatMessage({
                id: 'utenlandsopphold.om_oppholdet_ditt_modal.button.avbryt',
              })}
            </Button>
          )}
        </HStack>
      </VStack>
    </form>
  )
}
