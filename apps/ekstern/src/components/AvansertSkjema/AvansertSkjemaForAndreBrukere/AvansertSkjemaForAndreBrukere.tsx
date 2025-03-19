import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'

import {
  Alert,
  BodyLong,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from '@navikt/ds-react'
import clsx from 'clsx'

import {
  AvansertSkjemaIntroEndring,
  AvansertSkjemaInntekt,
  FormButtonRow,
  ReadMoreOmPensjonsalder,
} from '../Felles'
import { useFormLocalState, useFormValidationErrors } from '../hooks'
import { AVANSERT_FORM_NAMES, onAvansertBeregningSubmit } from '../utils'
import { AgePicker } from '@/components/common/AgePicker'
import { Divider } from '@/components/common/Divider'
import { ReadMore } from '@/components/common/ReadMore'
import { VilkaarsproevingAlert } from '@/components/VilkaarsproevingAlert'
import { BeregningContext } from '@/pages/Beregning/context'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectFoedselsdato,
  selectLoependeVedtak,
  selectCurrentSimulation,
  selectIsEndring,
  selectAarligInntektFoerUttakBeloep,
  selectAarligInntektFoerUttakBeloepFraSkatt,
  selectAarligInntektFoerUttakBeloepFraBrukerInput,
  selectNedreAldersgrense,
  selectNormertPensjonsalder,
} from '@/state/userInput/selectors'
import {
  DEFAULT_MAX_OPPTJENINGSALDER,
  formatUttaksalder,
  getBrukerensAlderISluttenAvMaaneden,
} from '@/utils/alder'
import { updateAndFormatInntektFromInputField } from '@/utils/inntekt'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './AvansertSkjemaForAndreBrukere.module.scss'

export const AvansertSkjemaForAndreBrukere: React.FC<{
  vilkaarsproeving?: Vilkaarsproeving
}> = ({ vilkaarsproeving }) => {
  const intl = useIntl()
  const dispatch = useAppDispatch()

  const { setAvansertSkjemaModus } = React.useContext(BeregningContext)

  const foedselsdato = useAppSelector(selectFoedselsdato)
  const normertPensjonsalder = useAppSelector(selectNormertPensjonsalder)
  const isEndring = useAppSelector(selectIsEndring)
  const inntektVsaHeltUttakInputRef = React.useRef<HTMLInputElement>(null)
  const inntektVsaGradertUttakInputRef = React.useRef<HTMLInputElement>(null)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
  const nedreAldersgrense = useAppSelector(selectNedreAldersgrense)
  const { uttaksalder, gradertUttaksperiode, aarligInntektVsaHelPensjon } =
    useAppSelector(selectCurrentSimulation)
  const aarligInntektFoerUttakBeloepFraBrukerInput = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraBrukerInput
  )
  const aarligInntektFoerUttakBeloepFraBrukerSkatt = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraSkatt
  )
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )
  const formatertNormertPensjonsalder = formatUttaksalder(
    intl,
    normertPensjonsalder
  )
  const { harAvansertSkjemaUnsavedChanges } = React.useContext(BeregningContext)

  const gaaTilResultat = () => {
    setAvansertSkjemaModus('resultat')
    window.scrollTo(0, 0)
  }

  const agePickerMinAlder = loependeVedtak.ufoeretrygd.grad
    ? normertPensjonsalder
    : getBrukerensAlderISluttenAvMaaneden(foedselsdato, nedreAldersgrense)

  const [
    localInntektFremTilUttak,
    localHeltUttak,
    localHarInntektVsaHeltUttakRadio,
    localGradertUttak,
    localHarInntektVsaGradertUttakRadio,
    minAlderInntektSluttAlder,
    muligeUttaksgrad,
    {
      setLocalInntektFremTilUttak,
      setLocalHeltUttak,
      setLocalGradertUttak,
      setLocalHarInntektVsaHeltUttakRadio,
      setLocalHarInntektVsaGradertUttakRadio,
    },
  ] = useFormLocalState({
    isEndring,
    ufoeregrad: loependeVedtak.ufoeretrygd.grad,
    aarligInntektFoerUttakBeloepFraBrukerSkattBeloep:
      aarligInntektFoerUttakBeloepFraBrukerSkatt?.beloep,
    aarligInntektFoerUttakBeloepFraBrukerInput,
    uttaksalder,
    aarligInntektVsaHelPensjon,
    gradertUttaksperiode,
    normertPensjonsalder,
    beregningsvalg: null,
  })

  const [
    validationErrors,
    gradertUttakAgePickerError,
    heltUttakAgePickerError,
    {
      setValidationErrors,
      setValidationErrorUttaksalderHeltUttak,
      setValidationErrorInntektVsaHeltUttak,
      setValidationErrorInntektVsaHeltUttakSluttAlder,
      setValidationErrorInntektVsaGradertUttak,
      resetValidationErrors,
    },
  ] = useFormValidationErrors({
    grad: localGradertUttak?.grad,
  })

  const handleHeltUttaksalderChange = (alder: Partial<Alder> | undefined) => {
    setValidationErrorUttaksalderHeltUttak('')
    setLocalHeltUttak((prevState) => {
      const sluttAlderAntallMaaneder =
        prevState?.aarligInntektVsaPensjon?.sluttAlder?.aar !== undefined
          ? prevState?.aarligInntektVsaPensjon?.sluttAlder.aar * 12 +
            (prevState?.aarligInntektVsaPensjon?.sluttAlder.maaneder ?? 0)
          : 0
      const shouldDeleteInntektVsaPensjon =
        alder?.aar &&
        alder?.aar * 12 + (alder?.maaneder ?? 0) >= sluttAlderAntallMaaneder
      return {
        ...prevState,
        uttaksalder: alder,
        aarligInntektVsaPensjon:
          shouldDeleteInntektVsaPensjon || !prevState?.aarligInntektVsaPensjon
            ? undefined
            : { ...prevState?.aarligInntektVsaPensjon },
      }
    })
  }

  const handleGradertUttaksalderChange = (
    alder: Partial<Alder> | undefined
  ) => {
    setLocalGradertUttak((previous) => ({
      ...previous,
      uttaksalder: alder,
    }))
  }

  const handleUttaksgradChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        [AVANSERT_FORM_NAMES.uttaksgrad]: '',
        [AVANSERT_FORM_NAMES.uttaksalderGradertUttak]: '',
        [AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio]: '',
        [AVANSERT_FORM_NAMES.inntektVsaGradertUttak]: '',
      }
    })
    const avansertBeregningFormatertUttaksgradAsNumber = parseInt(
      e.target.value.match(/\d+/)?.[0] as string,
      10
    )

    if (
      avansertBeregningFormatertUttaksgradAsNumber === 100 ||
      isNaN(avansertBeregningFormatertUttaksgradAsNumber)
    ) {
      const prevUttaksalder = localGradertUttak?.uttaksalder
        ? { ...localGradertUttak?.uttaksalder }
        : undefined
      // Hvis uttaksalder for gradert var fylt ut, overfører den til 100 % alderspensjon
      if (prevUttaksalder) {
        setLocalHeltUttak((previous) => {
          return {
            ...previous,
            uttaksalder: prevUttaksalder,
          }
        })
      }
      // empty the values for gradert
      setLocalGradertUttak({
        grad: 100,
      })
      setLocalHarInntektVsaGradertUttakRadio(null)
    } else {
      // if there was no gradert uttak from before, empty the value for helt
      if (localGradertUttak?.uttaksalder === undefined) {
        setLocalHeltUttak({
          uttaksalder: undefined,
          aarligInntektVsaPensjon: undefined,
        })
        setLocalHarInntektVsaHeltUttakRadio(null)
      }
      // transfer the uttaksalder value from the first age picker (helt) to gradert age picker
      setLocalGradertUttak((previous) => {
        return {
          ...previous,
          uttaksalder:
            previous?.uttaksalder === undefined
              ? localHeltUttak?.uttaksalder
              : previous?.uttaksalder,
          grad: avansertBeregningFormatertUttaksgradAsNumber,
        }
      })
    }
  }

  const handleInntektVsaHeltUttakRadioChange = (s: BooleanRadio) => {
    setLocalHarInntektVsaHeltUttakRadio(s === 'ja')
    setValidationErrors({
      [AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio]: '',
      [AVANSERT_FORM_NAMES.inntektVsaHeltUttak]: '',
      [AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder]: '',
    })
    if (s === 'nei') {
      setLocalHeltUttak((previous) => {
        return {
          ...previous,
          aarligInntektVsaPensjon: undefined,
        }
      })
    }
  }

  const handleInntektVsaGradertUttakRadioChange = (s: BooleanRadio) => {
    setLocalHarInntektVsaGradertUttakRadio(s === 'ja')
    setValidationErrors({
      [AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio]: '',
      [AVANSERT_FORM_NAMES.inntektVsaGradertUttak]: '',
    })
    if (s === 'nei') {
      setLocalGradertUttak((previous) => {
        return {
          ...previous,
          aarligInntektVsaPensjonBeloep: undefined,
        }
      })
    }
  }

  const handleInntektVsaHeltUttakChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    updateAndFormatInntektFromInputField(
      inntektVsaHeltUttakInputRef.current,
      e.target.value,
      (s: string) => {
        setLocalHeltUttak((previous) => ({
          ...previous,
          aarligInntektVsaPensjon: {
            ...previous?.aarligInntektVsaPensjon,
            beloep: s || undefined,
          },
        }))
      },
      setValidationErrorInntektVsaHeltUttak
    )
  }

  const handleInntektVsaHeltUttakSluttAlderChange = (
    alder: Partial<Alder> | undefined
  ) => {
    setValidationErrorInntektVsaHeltUttakSluttAlder('')
    setLocalHeltUttak((previous) => ({
      ...previous,
      aarligInntektVsaPensjon: {
        ...previous?.aarligInntektVsaPensjon,
        sluttAlder: alder,
      },
    }))
  }

  const handleInntektVsaGradertUttakChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    updateAndFormatInntektFromInputField(
      inntektVsaGradertUttakInputRef.current,
      e.target.value,
      (s: string) => {
        setLocalGradertUttak((previous) => ({
          ...previous,
          aarligInntektVsaPensjonBeloep: s || undefined,
        }))
      },
      setValidationErrorInntektVsaGradertUttak
    )
  }

  const resetForm = (): void => {
    resetValidationErrors()
    setLocalInntektFremTilUttak(
      aarligInntektFoerUttakBeloepFraBrukerSkatt?.beloep ?? null
    )
    setLocalGradertUttak(undefined)
    setLocalHeltUttak(undefined)
    setLocalHarInntektVsaGradertUttakRadio(null)
    setLocalHarInntektVsaHeltUttakRadio(null)
  }

  return (
    <>
      <form
        id={AVANSERT_FORM_NAMES.form}
        data-testid={'AVANSERT_SKJEMA_FOR_ANDRE_BRUKERE'}
        method="dialog"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          const data = new FormData(e.currentTarget)
          onAvansertBeregningSubmit(
            data,
            dispatch,
            setValidationErrors,
            gaaTilResultat,
            {
              foedselsdato: foedselsdato as string,
              normertPensjonsalder,
              loependeVedtak,
              localBeregningsTypeRadio: null,
              localInntektFremTilUttak,
              hasVilkaarIkkeOppfylt:
                vilkaarsproeving?.vilkaarErOppfylt === false,
              harAvansertSkjemaUnsavedChanges,
            }
          )
        }}
      ></form>

      <div
        className={clsx(styles.container, styles.container__hasMobilePadding)}
      >
        <div className={styles.form}>
          {isEndring && <AvansertSkjemaIntroEndring />}

          <AvansertSkjemaInntekt
            localInntektFremTilUttak={localInntektFremTilUttak}
            aarligInntektFoerUttakBeloep={aarligInntektFoerUttakBeloep}
            setLocalInntektFremTilUttak={setLocalInntektFremTilUttak}
          />

          <Divider noMargin />

          <div className={styles.alertWrapper} aria-live="polite">
            {validationErrors[
              AVANSERT_FORM_NAMES.endringAlertFremtidigDato
            ] && (
              <Alert variant="warning">
                <FormattedMessage
                  id="beregning.endring.alert.uttaksdato"
                  values={{
                    ...getFormatMessageValues(),
                    dato: validationErrors[
                      AVANSERT_FORM_NAMES.endringAlertFremtidigDato
                    ],
                  }}
                />
              </Alert>
            )}
          </div>

          <div className={styles.alertWrapper} aria-live="polite">
            {vilkaarsproeving &&
              !vilkaarsproeving?.vilkaarErOppfylt &&
              uttaksalder && (
                <VilkaarsproevingAlert
                  vilkaarsproeving={vilkaarsproeving}
                  uttaksalder={uttaksalder}
                />
              )}
          </div>

          <div>
            {localGradertUttak?.grad !== undefined &&
            localGradertUttak?.grad !== 100 ? (
              <AgePicker
                form={AVANSERT_FORM_NAMES.form}
                name={AVANSERT_FORM_NAMES.uttaksalderGradertUttak}
                label={
                  <FormattedMessage
                    id={
                      isEndring
                        ? 'velguttaksalder.endring.title'
                        : 'velguttaksalder.title'
                    }
                  />
                }
                value={localGradertUttak?.uttaksalder}
                onChange={handleGradertUttaksalderChange}
                error={gradertUttakAgePickerError}
                minAlder={agePickerMinAlder}
              />
            ) : (
              <AgePicker
                form={AVANSERT_FORM_NAMES.form}
                name={AVANSERT_FORM_NAMES.uttaksalderHeltUttak}
                label={
                  <FormattedMessage
                    id={
                      isEndring
                        ? 'velguttaksalder.endring.title'
                        : 'velguttaksalder.title'
                    }
                  />
                }
                value={localHeltUttak?.uttaksalder}
                onChange={handleHeltUttaksalderChange}
                error={heltUttakAgePickerError}
                minAlder={agePickerMinAlder}
              />
            )}

            <div className={styles.spacer__small} />

            <ReadMoreOmPensjonsalder
              ufoeregrad={loependeVedtak.ufoeretrygd.grad}
              isEndring={isEndring}
            />
          </div>

          <div>
            <Select
              form={AVANSERT_FORM_NAMES.form}
              name={AVANSERT_FORM_NAMES.uttaksgrad}
              data-testid={AVANSERT_FORM_NAMES.uttaksgrad}
              className={styles.select}
              label={intl.formatMessage({
                id: 'beregning.avansert.rediger.uttaksgrad.label',
              })}
              description={intl.formatMessage({
                id: isEndring
                  ? 'beregning.avansert.rediger.uttaksgrad.endring.description'
                  : 'beregning.avansert.rediger.uttaksgrad.description',
              })}
              value={
                localGradertUttak?.grad !== undefined
                  ? `${localGradertUttak.grad} %`
                  : ''
              }
              onChange={handleUttaksgradChange}
              error={
                validationErrors[AVANSERT_FORM_NAMES.uttaksgrad]
                  ? intl.formatMessage(
                      {
                        id: validationErrors[AVANSERT_FORM_NAMES.uttaksgrad],
                      },
                      {
                        ...getFormatMessageValues(),
                        normertPensjonsalder: formatertNormertPensjonsalder,
                      }
                    )
                  : ''
              }
              aria-required="true"
            >
              <option disabled value="">
                {' '}
              </option>
              {muligeUttaksgrad.map((grad) => (
                <option key={grad} value={grad}>
                  {grad}
                </option>
              ))}
            </Select>

            <div className={styles.spacer__small} />

            <ReadMore
              name="Om uttaksgrad"
              header={intl.formatMessage({
                id: 'beregning.avansert.rediger.read_more.uttaksgrad.label',
              })}
            >
              <BodyLong data-testid="om-uttaksgrad">
                <FormattedMessage
                  id={
                    isEndring && loependeVedtak.ufoeretrygd.grad === 0
                      ? 'beregning.avansert.rediger.read_more.uttaksgrad.endring.body'
                      : 'beregning.avansert.rediger.read_more.uttaksgrad.body'
                  }
                  values={{
                    ...getFormatMessageValues(),
                  }}
                />
              </BodyLong>
            </ReadMore>
          </div>

          {localGradertUttak?.uttaksalder?.aar &&
            localGradertUttak?.uttaksalder?.maaneder !== undefined &&
            localGradertUttak?.grad !== undefined &&
            localGradertUttak.grad !== 100 && (
              <>
                <div>
                  <RadioGroup
                    legend={
                      <FormattedMessage
                        id="beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak"
                        values={{
                          ...getFormatMessageValues(),
                          grad: localGradertUttak.grad,
                        }}
                      />
                    }
                    description={
                      <FormattedMessage
                        id={
                          loependeVedtak.ufoeretrygd.grad &&
                          localGradertUttak.uttaksalder.aar <
                            normertPensjonsalder.aar
                            ? 'beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak.ufoeretrygd.description'
                            : 'beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak.description'
                        }
                      />
                    }
                    name={AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio}
                    data-testid={
                      AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio
                    }
                    value={
                      localHarInntektVsaGradertUttakRadio === null
                        ? null
                        : localHarInntektVsaGradertUttakRadio
                          ? 'ja'
                          : 'nei'
                    }
                    onChange={handleInntektVsaGradertUttakRadioChange}
                    error={
                      validationErrors[
                        AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio
                      ]
                        ? intl.formatMessage(
                            {
                              id: validationErrors[
                                AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio
                              ],
                            },
                            {
                              ...getFormatMessageValues(),
                              grad: localGradertUttak.grad,
                            }
                          )
                        : ''
                    }
                    role="radiogroup"
                    aria-required="true"
                  >
                    <Radio
                      form={AVANSERT_FORM_NAMES.form}
                      data-testid={`${AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio}-ja`}
                      value="ja"
                      aria-invalid={
                        !!validationErrors[
                          AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio
                        ]
                      }
                    >
                      <FormattedMessage id="stegvisning.radio_ja" />
                    </Radio>

                    <Radio
                      form={AVANSERT_FORM_NAMES.form}
                      data-testid={`${AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio}-nei`}
                      value="nei"
                    >
                      <FormattedMessage id="stegvisning.radio_nei" />
                    </Radio>
                  </RadioGroup>

                  {loependeVedtak.ufoeretrygd.grad &&
                  localGradertUttak.uttaksalder.aar <
                    normertPensjonsalder.aar ? (
                    <ReadMore
                      name="Om inntekt og uføretrygd"
                      header={intl.formatMessage({
                        id: 'inntekt.info_om_inntekt.ufoeretrygd.read_more.label',
                      })}
                    >
                      <BodyLong>
                        <FormattedMessage
                          id="inntekt.info_om_inntekt.ufoeretrygd.read_more.body"
                          values={{
                            ...getFormatMessageValues(),
                          }}
                        />
                      </BodyLong>
                    </ReadMore>
                  ) : null}
                </div>

                {localHarInntektVsaGradertUttakRadio && (
                  <div>
                    <TextField
                      ref={inntektVsaGradertUttakInputRef}
                      form={AVANSERT_FORM_NAMES.form}
                      name={AVANSERT_FORM_NAMES.inntektVsaGradertUttak}
                      data-testid={AVANSERT_FORM_NAMES.inntektVsaGradertUttak}
                      type="text"
                      inputMode="numeric"
                      className={styles.textfield}
                      label={
                        <FormattedMessage
                          id="beregning.avansert.rediger.inntekt_vsa_gradert_uttak.label"
                          values={{
                            ...getFormatMessageValues(),
                            grad: localGradertUttak.grad,
                          }}
                        />
                      }
                      description={intl.formatMessage({
                        id: 'beregning.avansert.rediger.inntekt_vsa_gradert_uttak.description',
                      })}
                      error={
                        validationErrors[
                          AVANSERT_FORM_NAMES.inntektVsaGradertUttak
                        ]
                          ? intl.formatMessage(
                              {
                                id: validationErrors[
                                  AVANSERT_FORM_NAMES.inntektVsaGradertUttak
                                ],
                              },
                              {
                                ...getFormatMessageValues(),
                                grad: localGradertUttak.grad,
                              }
                            )
                          : ''
                      }
                      onChange={handleInntektVsaGradertUttakChange}
                      value={localGradertUttak?.aarligInntektVsaPensjonBeloep}
                      max={5}
                      aria-required="true"
                    />
                  </div>
                )}

                <Divider noMargin />

                <div>
                  <AgePicker
                    form={AVANSERT_FORM_NAMES.form}
                    name={AVANSERT_FORM_NAMES.uttaksalderHeltUttak}
                    label={
                      <FormattedMessage
                        id="beregning.avansert.rediger.heltuttak.agepicker.label"
                        values={{
                          ...getFormatMessageValues(),
                        }}
                      />
                    }
                    value={localHeltUttak?.uttaksalder}
                    onChange={handleHeltUttaksalderChange}
                    error={heltUttakAgePickerError}
                    minAlder={agePickerMinAlder}
                  />
                </div>
              </>
            )}

          {localHeltUttak?.uttaksalder?.aar &&
            localHeltUttak?.uttaksalder?.maaneder !== undefined &&
            localGradertUttak?.grad !== undefined && (
              <div>
                <RadioGroup
                  legend={
                    <FormattedMessage
                      id="beregning.avansert.rediger.radio.inntekt_vsa_helt_uttak"
                      values={{ ...getFormatMessageValues() }}
                    />
                  }
                  description={
                    <FormattedMessage id="beregning.avansert.rediger.radio.inntekt_vsa_helt_uttak.description" />
                  }
                  name={AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}
                  data-testid={AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}
                  value={
                    localHarInntektVsaHeltUttakRadio === null
                      ? null
                      : localHarInntektVsaHeltUttakRadio
                        ? 'ja'
                        : 'nei'
                  }
                  onChange={handleInntektVsaHeltUttakRadioChange}
                  error={
                    validationErrors[
                      AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio
                    ]
                      ? intl.formatMessage(
                          {
                            id: validationErrors[
                              AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio
                            ],
                          },
                          { ...getFormatMessageValues() }
                        )
                      : ''
                  }
                  role="radiogroup"
                  aria-required="true"
                >
                  <Radio
                    form={AVANSERT_FORM_NAMES.form}
                    data-testid={`${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-ja`}
                    value="ja"
                    aria-invalid={
                      !!validationErrors[
                        AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio
                      ]
                    }
                  >
                    <FormattedMessage id="stegvisning.radio_ja" />
                  </Radio>

                  <Radio
                    form={AVANSERT_FORM_NAMES.form}
                    data-testid={`${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-nei`}
                    value="nei"
                  >
                    <FormattedMessage id="stegvisning.radio_nei" />
                  </Radio>
                </RadioGroup>
              </div>
            )}

          {localHeltUttak?.uttaksalder?.aar &&
            localHeltUttak?.uttaksalder?.maaneder !== undefined &&
            localHarInntektVsaHeltUttakRadio && (
              <>
                <div>
                  <TextField
                    ref={inntektVsaHeltUttakInputRef}
                    form={AVANSERT_FORM_NAMES.form}
                    name={AVANSERT_FORM_NAMES.inntektVsaHeltUttak}
                    data-testid={AVANSERT_FORM_NAMES.inntektVsaHeltUttak}
                    type="text"
                    inputMode="numeric"
                    className={styles.textfield}
                    label={
                      <FormattedMessage
                        id="inntekt.endre_inntekt_vsa_pensjon_modal.textfield.label"
                        values={{ ...getFormatMessageValues() }}
                      />
                    }
                    description={intl.formatMessage({
                      id: 'inntekt.endre_inntekt_vsa_pensjon_modal.textfield.description',
                    })}
                    error={
                      validationErrors[AVANSERT_FORM_NAMES.inntektVsaHeltUttak]
                        ? intl.formatMessage(
                            {
                              id: validationErrors[
                                AVANSERT_FORM_NAMES.inntektVsaHeltUttak
                              ],
                            },
                            { ...getFormatMessageValues() }
                          )
                        : undefined
                    }
                    onChange={handleInntektVsaHeltUttakChange}
                    value={localHeltUttak?.aarligInntektVsaPensjon?.beloep}
                    max={5}
                    aria-required="true"
                  />
                </div>

                <div>
                  <AgePicker
                    form={AVANSERT_FORM_NAMES.form}
                    name={AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}
                    label={intl.formatMessage({
                      id: 'inntekt.endre_inntekt_vsa_pensjon_modal.agepicker.label',
                    })}
                    value={localHeltUttak?.aarligInntektVsaPensjon?.sluttAlder}
                    minAlder={minAlderInntektSluttAlder}
                    maxAlder={DEFAULT_MAX_OPPTJENINGSALDER}
                    onChange={handleInntektVsaHeltUttakSluttAlderChange}
                    error={
                      validationErrors[
                        AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder
                      ]
                        ? `${intl.formatMessage({
                            id: validationErrors[
                              AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder
                            ],
                          })}.`
                        : ''
                    }
                  />
                </div>
              </>
            )}

          <FormButtonRow
            formId={AVANSERT_FORM_NAMES.form}
            resetForm={resetForm}
            gaaTilResultat={gaaTilResultat}
            hasVilkaarIkkeOppfylt={vilkaarsproeving?.vilkaarErOppfylt === false}
          />
        </div>
      </div>
    </>
  )
}
