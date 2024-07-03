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
import { add, sub } from 'date-fns'

import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import { UTENLANDSOPPHOLD_FORM_NAMES } from './utils'

import styles from './OmOppholdetDitt.module.scss'

interface Props {
  modalRef: React.RefObject<HTMLDialogElement>
  opphold?: Opphold
}
export const OmOppholdetDitt: React.FC<Props> = ({ modalRef, opphold }) => {
  const intl = useIntl()

  const [localOpphold, setLocalOpphold] = React.useState<
    RecursivePartial<Opphold>
  >({ ...opphold })
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({
    [UTENLANDSOPPHOLD_FORM_NAMES.land]: '',
    [UTENLANDSOPPHOLD_FORM_NAMES.harJobbet]: '',
    [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: '',
    [UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]: '',
  })

  const resetValidationErrors = () => {
    setValidationErrors({
      [UTENLANDSOPPHOLD_FORM_NAMES.land]: '',
      [UTENLANDSOPPHOLD_FORM_NAMES.harJobbet]: '',
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
    defaultSelected: localOpphold?.startdato
      ? (localOpphold?.startdato as Date)
      : undefined,
    onDateChange: (value): void => {
      setLocalOpphold((previous) => {
        return {
          ...previous,
          startdato: value,
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
    defaultSelected: localOpphold?.sluttdato
      ? (localOpphold?.sluttdato as Date)
      : undefined,
    onDateChange: (value): void => {
      setLocalOpphold((previous) => {
        return {
          ...previous,
          sluttdato: value,
        }
      })
    },
    // onValidate: (val: DateValidationT) => void;
  })

  React.useEffect(() => {
    setLocalOpphold({ ...opphold })
    datepickerStartdato.setSelected(opphold?.startdato)
    datepickerSluttdato.setSelected(opphold?.sluttdato)
  }, [opphold])

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
    setLocalOpphold((previous) => {
      return {
        ...previous,
        land: e.target.value,
      }
    })
  }

  const handleHarJobbetChange = (s: BooleanRadio) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.harJobbet]: '',
      }
    })
    setLocalOpphold((previous) => {
      return {
        ...previous,
        harJobbet: s === 'ja',
      }
    })
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const landData = data.get(UTENLANDSOPPHOLD_FORM_NAMES.land)
    const harJobbetData = data.get(UTENLANDSOPPHOLD_FORM_NAMES.harJobbet)
    const startdatoData = data.get(UTENLANDSOPPHOLD_FORM_NAMES.startdato)
    const sluttdatoData = data.get(UTENLANDSOPPHOLD_FORM_NAMES.sluttdato)
    console.log('data', landData, harJobbetData, startdatoData, sluttdatoData)

    // if (validateOpphold(oppholdData, updateValidationErrorMessage)) {
    // TODO Push to Redux
    logger('button klikk', {
      // TODO logge forskjell om det er endring eller nytt opphold?
      tekst: `legger til opphold`,
    })
    // window.scrollTo(0, 0)
    /* c8 ignore next 3 */
    if (modalRef.current?.open) {
      modalRef.current?.close()
    }
    // }
  }

  const onCancel = (): void => {
    setLocalOpphold({ ...opphold })
    datepickerStartdato.setSelected(opphold?.startdato)
    datepickerSluttdato.setSelected(opphold?.sluttdato)
    resetValidationErrors()
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
            <VStack gap="4">
              <Select
                form={UTENLANDSOPPHOLD_FORM_NAMES.form}
                name={UTENLANDSOPPHOLD_FORM_NAMES.land}
                data-testid={UTENLANDSOPPHOLD_FORM_NAMES.land}
                className={styles.select}
                label={intl.formatMessage({
                  id: 'utenlandsopphold.om_oppholdet_ditt_modal.land.label',
                })}
                value={localOpphold?.land ? localOpphold?.land : ''}
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
              {localOpphold?.land && (
                <>
                  <RadioGroup
                    form={UTENLANDSOPPHOLD_FORM_NAMES.form}
                    id={UTENLANDSOPPHOLD_FORM_NAMES.harJobbet}
                    name={UTENLANDSOPPHOLD_FORM_NAMES.harJobbet}
                    data-testid={UTENLANDSOPPHOLD_FORM_NAMES.harJobbet}
                    // className={styles.radiogroup}
                    legend={
                      <FormattedMessage
                        id="utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.label"
                        values={{ land: localOpphold.land }}
                      />
                    }
                    description={
                      <FormattedMessage id="utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.description" />
                    }
                    defaultValue={
                      localOpphold.harJobbet
                        ? 'ja'
                        : localOpphold.harJobbet === false
                          ? 'nei'
                          : null
                    }
                    onChange={handleHarJobbetChange}
                    error={
                      validationErrors[UTENLANDSOPPHOLD_FORM_NAMES.harJobbet]
                        ? intl.formatMessage(
                            {
                              id: validationErrors[
                                UTENLANDSOPPHOLD_FORM_NAMES.harJobbet
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
              id: 'utenlandsopphold.om_oppholdet_ditt_modal.button',
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
