import clsx from 'clsx'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Alert, Radio, RadioGroup, Select, TextField } from '@navikt/ds-react'

import { VilkaarsproevingAlert } from '@/components/VilkaarsproevingAlert'
import { AgePicker } from '@/components/common/AgePicker'
import { Divider } from '@/components/common/Divider'
import { SanityReadmore } from '@/components/common/SanityReadmore'
import { BeregningContext } from '@/pages/Beregning/context'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttakBeloep,
  selectAarligInntektFoerUttakBeloepFraBrukerInput,
  selectAarligInntektFoerUttakBeloepFraSkatt,
  selectCurrentSimulation,
  selectFoedselsdato,
  selectIsEndring,
  selectLoependeVedtak,
  selectMaxOpptjeningsalder,
  selectNedreAldersgrense,
  selectNormertPensjonsalder,
} from '@/state/userInput/selectors'
import {
  UTTAKSALDER_FOR_AP_VED_PRE2025_OFFENTLIG_AFP,
  formatUttaksalder,
  getBrukerensAlderISluttenAvMaaneden,
} from '@/utils/alder'
import { updateAndFormatInntektFromInputField } from '@/utils/inntekt'
import { getFormatMessageValues } from '@/utils/translations'

import {
  AvansertSkjemaInntekt,
  AvansertSkjemaIntroEndring,
  FormButtonRow,
  ReadMoreOmPensjonsalder,
} from '../Felles'
import { useFormLocalState, useFormValidationErrors } from '../hooks'
import { AVANSERT_FORM_NAMES, onAvansertBeregningSubmit } from '../utils'

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
  const maxOpptjeningsalder = useAppSelector(selectMaxOpptjeningsalder)
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

  // Når bruker velger "Endre avansert valg" og hadde uttaks alder satt til mindre enn 67 år som er tidligst uttaks alder for bruker med pre2025 offentlig AFP, da kan alert være stående.
  const [showPre2025OffentligAfpAlert, setShowPre2025OffentligAfpAlert] =
    React.useState<boolean>(
      Boolean(
        uttaksalder &&
          uttaksalder?.aar < UTTAKSALDER_FOR_AP_VED_PRE2025_OFFENTLIG_AFP.aar &&
          loependeVedtak.pre2025OffentligAfp
      )
    )

  const {
    localInntektFremTilUttak,
    localHeltUttak,
    localHarInntektVsaHeltUttakRadio,
    localGradertUttak,
    localHarInntektVsaGradertUttakRadio,
    minAlderInntektSluttAlder,
    muligeUttaksgrad,
    handlers: {
      setLocalInntektFremTilUttak,
      setLocalHeltUttak,
      setLocalGradertUttak,
      setLocalHarInntektVsaHeltUttakRadio,
      setLocalHarInntektVsaGradertUttakRadio,
    },
  } = useFormLocalState({
    isEndring,
    ufoeregrad: loependeVedtak.ufoeretrygd.grad,
    aarligInntektFoerUttakBeloepFraBrukerSkattBeloep:
      aarligInntektFoerUttakBeloepFraBrukerSkatt?.beloep,
    aarligInntektFoerUttakBeloepFraBrukerInput,
    uttaksalder,
    aarligInntektVsaHelPensjon,
    gradertUttaksperiode,
    afpInntektMaanedFoerUttak: null,
    normertPensjonsalder,
    beregningsvalg: null,
  })

  const {
    validationErrors,
    gradertUttakAgePickerError,
    heltUttakAgePickerError,
    handlers: {
      setValidationErrors,
      setValidationErrorUttaksalderGradertUttak,
      setValidationErrorUttaksalderHeltUttak,
      setValidationErrorInntektVsaHeltUttak,
      setValidationErrorInntektVsaHeltUttakSluttAlder,
      setValidationErrorInntektVsaGradertUttak,
      resetValidationErrors,
    },
  } = useFormValidationErrors({
    grad: localGradertUttak?.grad,
  })

  const handleHeltUttaksalderChange = (alder: Partial<Alder> | undefined) => {
    if (localGradertUttak?.grad === 100 || !localGradertUttak?.grad) {
      setShowPre2025OffentligAfpAlert(
        Boolean(
          alder &&
            alder.aar !== undefined &&
            alder.aar < UTTAKSALDER_FOR_AP_VED_PRE2025_OFFENTLIG_AFP.aar &&
            loependeVedtak.pre2025OffentligAfp
        )
      )
    }
    setValidationErrorUttaksalderHeltUttak('')
    setLocalHeltUttak((prevState) => {
      const sluttAlderAntallMaaneder =
        prevState?.aarligInntektVsaPensjon?.sluttAlder?.aar !== undefined
          ? prevState?.aarligInntektVsaPensjon?.sluttAlder.aar * 12 +
            (prevState?.aarligInntektVsaPensjon?.sluttAlder.maaneder ?? 0)
          : 0
      const shouldClearInntektSluttAlder =
        alder?.aar &&
        alder?.aar * 12 + (alder?.maaneder ?? 0) >= sluttAlderAntallMaaneder
      return {
        uttaksalder: alder,
        aarligInntektVsaPensjon: {
          ...prevState?.aarligInntektVsaPensjon,
          sluttAlder: shouldClearInntektSluttAlder
            ? undefined
            : { ...prevState?.aarligInntektVsaPensjon?.sluttAlder },
        },
      }
    })
  }

  const handleGradertUttaksalderChange = (
    alder: Partial<Alder> | undefined
  ) => {
    setShowPre2025OffentligAfpAlert(
      Boolean(
        alder &&
          alder.aar !== undefined &&
          alder.aar < UTTAKSALDER_FOR_AP_VED_PRE2025_OFFENTLIG_AFP.aar &&
          loependeVedtak.pre2025OffentligAfp
      )
    )
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        [AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio]: '',
        [AVANSERT_FORM_NAMES.uttaksalderHeltUttak]: '',
      }
    })
    setValidationErrorUttaksalderGradertUttak('')
    setLocalGradertUttak((previous) => ({
      ...previous,
      uttaksalder: alder,
    }))
  }

  const handleUttaksgradChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        [AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio]: '',
        [AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio]: '',
        [AVANSERT_FORM_NAMES.uttaksgrad]: '',
        [AVANSERT_FORM_NAMES.uttaksalderGradertUttak]: '',
        [AVANSERT_FORM_NAMES.uttaksalderHeltUttak]: '',
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
    setShowPre2025OffentligAfpAlert(false)
  }

  return (
    <>
      <form
        id={AVANSERT_FORM_NAMES.form}
        data-testid="AVANSERT_SKJEMA_FOR_ANDRE_BRUKERE"
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
              localInntektFremTilUttak,
              hasVilkaarIkkeOppfylt:
                vilkaarsproeving?.vilkaarErOppfylt === false,
              harAvansertSkjemaUnsavedChanges,
            }
          )
        }}
      />

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
                  alternativ={vilkaarsproeving?.alternativ}
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

          {showPre2025OffentligAfpAlert && (
            <Alert
              data-testid="pre2025OffentligAfp-alert"
              variant="info"
              aria-live="polite"
              style={{ marginTop: '-1rem' }}
            >
              <FormattedMessage id="beregning.avansert.rediger.pre2025_offentlig_afp.alert" />
            </Alert>
          )}

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

            <SanityReadmore
              id={
                isEndring && loependeVedtak.ufoeretrygd.grad === 0
                  ? 'om_uttaksgrad_endring'
                  : 'om_uttaksgrad'
              }
            />
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
                    <SanityReadmore id="om_alderspensjon_inntektsgrense_UT" />
                  ) : null}
                </div>

                {localHarInntektVsaGradertUttakRadio && (
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
                    value={
                      localGradertUttak.aarligInntektVsaPensjonBeloep ?? ''
                    }
                  />
                )}

                <Divider noMargin />

                <AgePicker
                  form={AVANSERT_FORM_NAMES.form}
                  name={AVANSERT_FORM_NAMES.uttaksalderHeltUttak}
                  label={
                    <FormattedMessage
                      id="beregning.avansert.rediger.heltuttak.agepicker.label"
                      values={getFormatMessageValues()}
                    />
                  }
                  value={localHeltUttak?.uttaksalder}
                  onChange={handleHeltUttaksalderChange}
                  error={heltUttakAgePickerError}
                  minAlder={agePickerMinAlder}
                />
              </>
            )}

          {localHeltUttak?.uttaksalder?.aar &&
            localHeltUttak?.uttaksalder?.maaneder !== undefined &&
            localGradertUttak?.grad !== undefined && (
              <RadioGroup
                legend={
                  <FormattedMessage
                    id="beregning.avansert.rediger.radio.inntekt_vsa_helt_uttak"
                    values={getFormatMessageValues()}
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
                  validationErrors[AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio]
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
            )}

          {localHeltUttak?.uttaksalder?.aar &&
            localHeltUttak.uttaksalder.maaneder !== undefined &&
            localHarInntektVsaHeltUttakRadio && (
              <>
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
                      values={getFormatMessageValues()}
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
                  value={localHeltUttak.aarligInntektVsaPensjon?.beloep ?? ''}
                />

                <AgePicker
                  form={AVANSERT_FORM_NAMES.form}
                  name={AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}
                  label={intl.formatMessage({
                    id: 'inntekt.endre_inntekt_vsa_pensjon_modal.agepicker.label',
                  })}
                  value={localHeltUttak?.aarligInntektVsaPensjon?.sluttAlder}
                  minAlder={minAlderInntektSluttAlder}
                  maxAlder={maxOpptjeningsalder}
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
