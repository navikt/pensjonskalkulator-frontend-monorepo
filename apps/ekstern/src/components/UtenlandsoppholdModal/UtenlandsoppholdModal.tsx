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
import { add, sub, parse, format } from 'date-fns'

import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { DATE_BACKEND_FORMAT } from '@/utils/dates'
import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import { UTENLANDSOPPHOLD_FORM_NAMES } from './utils'

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

  const [localUtenlandsperiode, setLocalUtenlandsperiode] = React.useState<
    RecursivePartial<Utenlandsperiode>
  >({ ...utenlandsperiode })
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({
    [UTENLANDSOPPHOLD_FORM_NAMES.land]: '',
    [UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands]: '',
    [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: '',
    [UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]: '',
  })

  const resetValidationErrors = () => {
    setValidationErrors({
      [UTENLANDSOPPHOLD_FORM_NAMES.land]: '',
      [UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands]: '',
      [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: '',
      [UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]: '',
    })
  }

  const datepickerStartdato = useDatepicker({
    fromDate: sub(new Date(), {
      years: 100,
    }),
    toDate: add(new Date(), {
      years: 20,
    }),
    defaultSelected: localUtenlandsperiode?.startdato
      ? parse(localUtenlandsperiode?.startdato, DATE_BACKEND_FORMAT, new Date())
      : undefined,
    onDateChange: (value): void => {
      setLocalUtenlandsperiode((previous) => {
        return {
          ...previous,
          startdato: value ? format(value, DATE_BACKEND_FORMAT) : undefined,
        }
      })
    },
    // onValidate: (val: DateValidationT) => void;
  })

  const datepickerSluttdato = useDatepicker({
    fromDate: sub(new Date(), {
      years: 100,
    }),
    toDate: add(new Date(), {
      years: 20,
    }),
    defaultSelected: localUtenlandsperiode?.sluttdato
      ? parse(localUtenlandsperiode?.sluttdato, DATE_BACKEND_FORMAT, new Date())
      : undefined,
    onDateChange: (value): void => {
      setLocalUtenlandsperiode((previous) => {
        return {
          ...previous,
          sluttdato: value ? format(value, DATE_BACKEND_FORMAT) : undefined,
        }
      })
    },
    // onValidate: (val: DateValidationT) => void;
  })

  React.useEffect(() => {
    setLocalUtenlandsperiode({ ...utenlandsperiode })
    if (utenlandsperiode?.startdato) {
      datepickerStartdato.setSelected(
        parse(utenlandsperiode?.startdato, DATE_BACKEND_FORMAT, new Date())
      )
    }
    if (utenlandsperiode?.sluttdato) {
      datepickerSluttdato.setSelected(
        parse(utenlandsperiode?.sluttdato, DATE_BACKEND_FORMAT, new Date())
      )
    }
  }, [utenlandsperiode])

  const muligeLand: string[] = [
    'Argentina',
    'Belgia',
    'Kina',
    'Sør-Afrika',
    'Tanzania',
  ]

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
        land: e.target.value,
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
    const landData = data.get(UTENLANDSOPPHOLD_FORM_NAMES.land)
    const arbeidetUtenlandsData = data.get(
      UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands
    )
    const startdatoData = data.get(UTENLANDSOPPHOLD_FORM_NAMES.startdato)
    const sluttdatoData = data.get(UTENLANDSOPPHOLD_FORM_NAMES.sluttdato)

    // if (validateOpphold(oppholdData, updateValidationErrorMessage)) {
    const updatedUtenlandsperiode = {
      id: utenlandsperiode?.id
        ? utenlandsperiode.id
        : `${Date.now()}-${Math.random()}`,
      land: landData as string,
      arbeidetUtenlands: arbeidetUtenlandsData === 'ja',
      startdato: startdatoData as string,
      sluttdato: sluttdatoData ? (sluttdatoData as string) : undefined,
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
    // }
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
    <>
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
                  localUtenlandsperiode?.land ? localUtenlandsperiode?.land : ''
                }
                onChange={handleLandChange}
                error={
                  validationErrors[UTENLANDSOPPHOLD_FORM_NAMES.land]
                    ? intl.formatMessage(
                        {
                          id: validationErrors[
                            UTENLANDSOPPHOLD_FORM_NAMES.land
                          ],
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
                {muligeLand.map((land) => (
                  <option key={land} value={land}>
                    {land}
                  </option>
                ))}
              </Select>
              {localUtenlandsperiode?.land && (
                <>
                  <RadioGroup
                    form={UTENLANDSOPPHOLD_FORM_NAMES.form}
                    id={UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands}
                    name={UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands}
                    data-testid={UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands}
                    legend={
                      <FormattedMessage
                        id="utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.label"
                        values={{ land: localUtenlandsperiode.land }}
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
              id: 'stegvisning.avbryt',
            })}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
