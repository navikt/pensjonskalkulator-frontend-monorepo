import { format } from 'date-fns'
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

import styles from './UtenlandsoppholdModal.module.scss'

interface Props {
  modalRef: React.RefObject<HTMLDialogElement | null>
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
  const locale = getSelectedLanguage()

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
    modalRef,
    foedselsdato,
    utenlandsperiode,
    onSubmitCallback,
  })

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
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            e.stopPropagation()
            const data = new FormData(e.currentTarget)
            onUtenlandsoppholdSubmit(
              data,
              dispatch,
              setValidationErrors,
              modalRef,
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
                        ...getFormatMessageValues(),
                        land: validationErrors[
                          UTENLANDSOPPHOLD_FORM_NAMES.overlappende_land
                        ],
                        periodestart:
                          validationErrors[
                            UTENLANDSOPPHOLD_FORM_NAMES
                              .overlappende_periodestart
                          ],
                        periodeslutt: validationErrors[
                          UTENLANDSOPPHOLD_FORM_NAMES.overlappende_periodeslutt
                        ]
                          ? validationErrors[
                              UTENLANDSOPPHOLD_FORM_NAMES
                                .overlappende_periodeslutt
                            ]
                          : intl.formatMessage({
                              id: 'stegvisning.utenlandsopphold.oppholdene.description.periode.varig_opphold',
                            }),
                      }
                    )
                  : ''
              }
              aria-required="true"
            >
              <option disabled value="">
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
                {harLocalLandKravOmArbeid && (
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
                              ...getFormatMessageValues(),
                              land: validationErrors[
                                UTENLANDSOPPHOLD_FORM_NAMES.overlappende_land
                              ],
                              periodestart:
                                validationErrors[
                                  UTENLANDSOPPHOLD_FORM_NAMES
                                    .overlappende_periodestart
                                ],
                              periodeslutt: validationErrors[
                                UTENLANDSOPPHOLD_FORM_NAMES
                                  .overlappende_periodeslutt
                              ]
                                ? validationErrors[
                                    UTENLANDSOPPHOLD_FORM_NAMES
                                      .overlappende_periodeslutt
                                  ]
                                : intl.formatMessage({
                                    id: 'stegvisning.utenlandsopphold.oppholdene.description.periode.varig_opphold',
                                  }),
                            }
                          )
                        : ''
                    }
                    role="radiogroup"
                    aria-required="true"
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
                              maxDato: format(maxDate, DATE_ENDUSER_FORMAT),
                              land: validationErrors[
                                UTENLANDSOPPHOLD_FORM_NAMES.overlappende_land
                              ],
                              periodestart:
                                validationErrors[
                                  UTENLANDSOPPHOLD_FORM_NAMES
                                    .overlappende_periodestart
                                ],
                              periodeslutt: validationErrors[
                                UTENLANDSOPPHOLD_FORM_NAMES
                                  .overlappende_periodeslutt
                              ]
                                ? validationErrors[
                                    UTENLANDSOPPHOLD_FORM_NAMES
                                      .overlappende_periodeslutt
                                  ]
                                : intl.formatMessage({
                                    id: 'stegvisning.utenlandsopphold.oppholdene.description.periode.varig_opphold',
                                  }),
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
          </VStack>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          form={UTENLANDSOPPHOLD_FORM_NAMES.form}
          data-testid="legg-til-utenlandsopphold-submit"
        >
          {intl.formatMessage({
            id: utenlandsperiode
              ? 'utenlandsopphold.om_oppholdet_ditt_modal.button.oppdater'
              : 'utenlandsopphold.om_oppholdet_ditt_modal.button.legg_til',
          })}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          data-testid="legg-til-utenlandsopphold-avbryt"
        >
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
