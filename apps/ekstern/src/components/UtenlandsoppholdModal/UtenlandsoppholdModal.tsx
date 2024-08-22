import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Button,
  DatePicker,
  Modal,
  Radio,
  RadioGroup,
  Select,
  VStack,
  useDatepicker,
} from '@navikt/ds-react'
import { add, parse, format, isValid } from 'date-fns'

import landListeData from '../../assets/land-liste.json' with { type: 'json' }
import { getSelectedLanguage } from '@/context/LanguageProvider/utils'
import { useAppDispatch } from '@/state/hooks'
import { useAppSelector } from '@/state/hooks'
import {
  selectFoedselsdato,
  selectCurrentSimulationUtenlandsperioder,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { DATE_BACKEND_FORMAT, DATE_ENDUSER_FORMAT } from '@/utils/dates'
import { getTranslatedLand, getTranslatedLandFromLandkode } from '@/utils/land'
import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import {
  UtenlandsoppholdFormNames,
  UTENLANDSOPPHOLD_FORM_NAMES,
  UTENLANDSOPPHOLD_INITIAL_FORM_VALIDATION_ERRORS,
  validateOpphold,
} from './utils'

import styles from './UtenlandsoppholdModal.module.scss'

interface Props {
  modalRef: React.RefObject<HTMLDialogElement>
  utenlandsperiode?: Utenlandsperiode
  onSubmitCallback: () => void
}

export const UtenlandsoppholdModal: React.FC<Props> = ({
  modalRef,
  utenlandsperiode,
  onSubmitCallback,
}) => {
  const intl = useIntl()
  const dispatch = useAppDispatch()

  const foedselsdato = useAppSelector(selectFoedselsdato)
  const utenlandsperioder = useAppSelector(
    selectCurrentSimulationUtenlandsperioder
  )

  const [localUtenlandsperiode, setLocalUtenlandsperiode] = React.useState<
    RecursivePartial<Utenlandsperiode>
  >({ ...utenlandsperiode })
  const [validationErrors, setValidationErrors] = React.useState<
    Record<UtenlandsoppholdFormNames, string>
  >(UTENLANDSOPPHOLD_INITIAL_FORM_VALIDATION_ERRORS)

  const locale = getSelectedLanguage()

  const resetValidationErrors = () => {
    setValidationErrors(UTENLANDSOPPHOLD_INITIAL_FORM_VALIDATION_ERRORS)
  }

  const maxDate = React.useMemo(() => {
    return foedselsdato
      ? add(parse(foedselsdato as string, DATE_BACKEND_FORMAT, new Date()), {
          years: 100,
        })
      : add(new Date(), { years: 100 })
  }, [foedselsdato])

  const datepickerStartdato = useDatepicker({
    fromDate: foedselsdato
      ? parse(foedselsdato as string, DATE_BACKEND_FORMAT, new Date())
      : add(new Date(), { years: -100 }),
    toDate: maxDate,
    defaultSelected: localUtenlandsperiode?.startdato
      ? parse(localUtenlandsperiode?.startdato, DATE_ENDUSER_FORMAT, new Date())
      : undefined,
    onDateChange: (value): void => {
      setLocalUtenlandsperiode((previous) => {
        return {
          ...previous,
          startdato: value ? format(value, DATE_ENDUSER_FORMAT) : undefined,
        }
      })
    },
    onValidate: () => {
      setValidationErrors((prevState) => {
        return {
          ...prevState,
          [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: '',
        }
      })
    },
  })

  const datepickerSluttdato = useDatepicker({
    fromDate:
      localUtenlandsperiode?.startdato &&
      isValid(
        parse(localUtenlandsperiode?.startdato, DATE_ENDUSER_FORMAT, new Date())
      )
        ? parse(
            localUtenlandsperiode?.startdato,
            DATE_ENDUSER_FORMAT,
            new Date()
          )
        : foedselsdato
          ? parse(foedselsdato as string, DATE_BACKEND_FORMAT, new Date())
          : new Date(),
    toDate: maxDate,
    defaultSelected: localUtenlandsperiode?.sluttdato
      ? parse(localUtenlandsperiode?.sluttdato, DATE_ENDUSER_FORMAT, new Date())
      : undefined,
    onDateChange: (value): void => {
      setLocalUtenlandsperiode((previous) => {
        return {
          ...previous,
          sluttdato: value ? format(value, DATE_ENDUSER_FORMAT) : undefined,
        }
      })
    },
    onValidate: () => {
      setValidationErrors((prevState) => {
        return {
          ...prevState,
          [UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]: '',
        }
      })
    },
  })

  React.useEffect(() => {
    setLocalUtenlandsperiode({ ...utenlandsperiode })
    if (utenlandsperiode?.startdato) {
      datepickerStartdato.setSelected(
        parse(utenlandsperiode?.startdato, DATE_ENDUSER_FORMAT, new Date())
      )
    }
    if (utenlandsperiode?.sluttdato) {
      datepickerSluttdato.setSelected(
        parse(utenlandsperiode?.sluttdato, DATE_ENDUSER_FORMAT, new Date())
      )
    }
  }, [utenlandsperiode])

  const handleLandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.land]: '',
      }
    })
    setLocalUtenlandsperiode((previous) => {
      return {
        ...previous,
        landkode: e.target.value,
      }
    })
  }

  const handleArbeidetUtenlandsChange = (s: BooleanRadio) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands]: '',
      }
    })
    setLocalUtenlandsperiode((previous) => {
      return {
        ...previous,
        arbeidetUtenlands: s === 'ja',
      }
    })
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const landFormData = data.get(UTENLANDSOPPHOLD_FORM_NAMES.land)
    const arbeidetUtenlandsFormData = data.get(
      UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands
    )
    const startdatoFormData = data.get(UTENLANDSOPPHOLD_FORM_NAMES.startdato)
    const sluttdatoFormData = data.get(UTENLANDSOPPHOLD_FORM_NAMES.sluttdato)

    if (
      validateOpphold(
        {
          landFormData,
          arbeidetUtenlandsFormData,
          startdatoFormData,
          sluttdatoFormData,
        },
        foedselsdato,
        utenlandsperioder,
        setValidationErrors
      )
    ) {
      const updatedUtenlandsperiode = {
        id: utenlandsperiode?.id
          ? utenlandsperiode.id
          : `${Date.now()}-${Math.random()}`,
        landkode: landFormData as string,
        arbeidetUtenlands: arbeidetUtenlandsFormData === 'ja',
        startdato: startdatoFormData as string,
        sluttdato: sluttdatoFormData
          ? (sluttdatoFormData as string)
          : undefined,
      }

      dispatch(
        userInputActions.setCurrentSimulationUtenlandsperiode({
          ...updatedUtenlandsperiode,
        })
      )

      logger('button klikk', {
        tekst: utenlandsperiode
          ? `endrer utenlandsperiode`
          : `legger til utenlandsperiode`,
      })
      onSubmitCallback()
      if (modalRef.current?.open) {
        modalRef.current?.close()
      }
    }
  }

  const onCancel = (): void => {
    setLocalUtenlandsperiode({ ...utenlandsperiode })
    datepickerStartdato.setSelected(undefined)
    datepickerSluttdato.setSelected(undefined)
    resetValidationErrors()
    onSubmitCallback()
    if (modalRef.current?.open) {
      modalRef.current?.close()
    }
  }

  return (
    <Modal
      ref={modalRef}
      header={{
        heading: intl.formatMessage({
          id: 'utenlandsopphold.om_oppholdet_ditt_modal.title',
        }),
      }}
      onClose={onCancel}
      width="small"
    >
      <Modal.Body>
        <form
          id={UTENLANDSOPPHOLD_FORM_NAMES.form}
          method="dialog"
          onSubmit={onSubmit}
        >
          <VStack gap="6">
            <Select
              form={UTENLANDSOPPHOLD_FORM_NAMES.form}
              name={UTENLANDSOPPHOLD_FORM_NAMES.land}
              data-testid={UTENLANDSOPPHOLD_FORM_NAMES.land}
              className={styles.select}
              label={intl.formatMessage({
                id: 'utenlandsopphold.om_oppholdet_ditt_modal.land.label',
              })}
              value={
                localUtenlandsperiode?.landkode
                  ? localUtenlandsperiode?.landkode
                  : ''
              }
              onChange={handleLandChange}
              error={
                validationErrors[UTENLANDSOPPHOLD_FORM_NAMES.land]
                  ? intl.formatMessage(
                      {
                        id: validationErrors[UTENLANDSOPPHOLD_FORM_NAMES.land],
                      },
                      {
                        ...getFormatMessageValues(intl),
                      }
                    )
                  : ''
              }
              aria-required="true"
            >
              <option disabled selected value="">
                {' '}
              </option>
              {landListeData.map((land) => (
                <option key={land.landkode} value={land.landkode}>
                  {getTranslatedLand(land, locale)}
                </option>
              ))}
            </Select>
            {localUtenlandsperiode?.landkode && (
              <>
                <RadioGroup
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
                          {
                            ...getFormatMessageValues(intl),
                          }
                        )
                      : ''
                  }
                  role="radiogroup"
                  aria-required="true"
                >
                  <Radio value="ja">
                    <FormattedMessage id="utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.radio_ja" />
                  </Radio>
                  <Radio value="nei">
                    <FormattedMessage id="utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.radio_nei" />
                  </Radio>
                </RadioGroup>
                <DatePicker
                  {...datepickerStartdato.datepickerProps}
                  dropdownCaption
                >
                  <DatePicker.Input
                    {...datepickerStartdato.inputProps}
                    className={styles.datepicker}
                    form={UTENLANDSOPPHOLD_FORM_NAMES.form}
                    name={UTENLANDSOPPHOLD_FORM_NAMES.startdato}
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
                              ...getFormatMessageValues(intl),
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
                    label={intl.formatMessage({
                      id: 'utenlandsopphold.om_oppholdet_ditt_modal.sluttdato.label',
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
                              ...getFormatMessageValues(intl),
                              maxDato: format(maxDate, DATE_ENDUSER_FORMAT),
                            }
                          )
                        : ''
                    }
                  />
                </DatePicker>
              </>
            )}
          </VStack>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button form={UTENLANDSOPPHOLD_FORM_NAMES.form}>
          {intl.formatMessage({
            id: utenlandsperiode
              ? 'utenlandsopphold.om_oppholdet_ditt_modal.button.oppdater'
              : 'utenlandsopphold.om_oppholdet_ditt_modal.button.legg_til',
          })}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {intl.formatMessage({
            id: utenlandsperiode
              ? 'utenlandsopphold.om_oppholdet_ditt_modal.button.avbryt_endring'
              : 'utenlandsopphold.om_oppholdet_ditt_modal.button.avbryt',
          })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
