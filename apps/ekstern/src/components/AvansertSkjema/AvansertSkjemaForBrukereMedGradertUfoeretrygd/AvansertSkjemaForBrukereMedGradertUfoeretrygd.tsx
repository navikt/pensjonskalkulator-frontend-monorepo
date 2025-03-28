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
import { useGetGradertUfoereAfpFeatureToggleQuery } from '@/state/api/apiSlice'
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
  selectAfp,
  selectSamtykkeOffentligAFP,
} from '@/state/userInput/selectors'
import {
  DEFAULT_MAX_OPPTJENINGSALDER,
  formatUttaksalder,
  getBrukerensAlderISluttenAvMaaneden,
} from '@/utils/alder'
import { updateAndFormatInntektFromInputField } from '@/utils/inntekt'
import { getFormatMessageValues } from '@/utils/translations'

import { Beregningsvalg } from './Beregningsvalg'
import { IntroAFP } from './IntroAFP'

import styles from './AvansertSkjemaForBrukereMedGradertUfoeretrygd.module.scss'

export const AvansertSkjemaForBrukereMedGradertUfoeretrygd: React.FC<{
  vilkaarsproeving?: Vilkaarsproeving
}> = ({ vilkaarsproeving }) => {
  const intl = useIntl()
  const dispatch = useAppDispatch()

  const { setAvansertSkjemaModus } = React.useContext(BeregningContext)

  const { data: getGradertUfoereAfpFeatureToggle } =
    useGetGradertUfoereAfpFeatureToggleQuery()

  const isGradertUfoereAfpToggleEnabled =
    getGradertUfoereAfpFeatureToggle?.enabled

  const valgtAFP = useAppSelector(selectAfp)
  const isSamtykkeOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const foedselsdato = useAppSelector(selectFoedselsdato)
  const normertPensjonsalder = useAppSelector(selectNormertPensjonsalder)
  const isEndring = useAppSelector(selectIsEndring)
  const inntektVsaHeltUttakInputRef = React.useRef<HTMLInputElement>(null)
  const inntektVsaGradertUttakInputRef = React.useRef<HTMLInputElement>(null)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
  const nedreAldersgrense = useAppSelector(selectNedreAldersgrense)
  const {
    uttaksalder,
    gradertUttaksperiode,
    aarligInntektVsaHelPensjon,
    beregningsvalg,
  } = useAppSelector(selectCurrentSimulation)
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

  const brukerensAlderPlus1Maaned = getBrukerensAlderISluttenAvMaaneden(
    foedselsdato,
    nedreAldersgrense
  )

  const [
    localInntektFremTilUttak,
    localHeltUttak,
    localHarInntektVsaHeltUttakRadio,
    localGradertUttak,
    localHarInntektVsaGradertUttakRadio,
    minAlderInntektSluttAlder,
    muligeUttaksgrad,
    handlers,
    localBeregningsTypeRadio,
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
    beregningsvalg,
  })

  const {
    setLocalInntektFremTilUttak,
    setLocalHeltUttak,
    setLocalGradertUttak,
    setLocalHarInntektVsaHeltUttakRadio,
    setLocalHarInntektVsaGradertUttakRadio,
    setLocalBeregningsTypeRadio,
  } = handlers

  const [
    validationErrors,
    gradertUttakAgePickerError,
    heltUttakAgePickerError,
    {
      setValidationErrors,
      setValidationErrorUttaksalderHeltUttak,
      setValidationErrorUttaksalderGradertUttak,
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
    // Dersom brukeren endrer alderen til en alder som tillater flere graderinger, skal gradert uttak nullstilles
    const shouldResetGradertUttak =
      alder?.aar &&
      alder?.maaneder !== undefined &&
      alder?.aar >= normertPensjonsalder.aar
    setValidationErrorUttaksalderGradertUttak('')
    if (shouldResetGradertUttak) {
      // Overfører verdien tilbake til helt uttak
      setLocalHeltUttak((previous) => ({
        ...previous,
        uttaksalder: alder,
      }))
      setLocalHarInntektVsaGradertUttakRadio(null)
      setLocalGradertUttak(() => ({
        uttaksalder: undefined,
        grad: undefined,
        aarligInntektVsaPensjonBeloep: undefined,
      }))
    } else {
      setLocalGradertUttak((previous) => ({
        ...previous,
        uttaksalder: alder,
      }))
    }
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

  const handleBeregningsvalgChange = (newBeregningsvalg: Beregningsvalg) => {
    resetForm()
    if (newBeregningsvalg === 'med_afp') {
      setLocalHeltUttak((prevState) => ({
        ...prevState,
        uttaksalder: { ...nedreAldersgrense },
      }))
    }
    setLocalBeregningsTypeRadio(newBeregningsvalg)
  }

  const resetForm = (): void => {
    resetValidationErrors()
    setLocalBeregningsTypeRadio(null)
    setLocalInntektFremTilUttak(
      aarligInntektFoerUttakBeloepFraBrukerSkatt?.beloep ?? null
    )
    setLocalGradertUttak(undefined)
    setLocalHeltUttak(undefined)
    setLocalHarInntektVsaGradertUttakRadio(null)
    setLocalHarInntektVsaHeltUttakRadio(null)
  }

  const hasSelectedBeregning = !!localBeregningsTypeRadio

  const hasSelectedAFP =
    (valgtAFP === 'ja_offentlig' && isSamtykkeOffentligAFP) ||
    valgtAFP === 'ja_privat'

  const showFormFields =
    hasSelectedBeregning || !hasSelectedAFP || !isGradertUfoereAfpToggleEnabled

  return (
    <>
      <form
        id={AVANSERT_FORM_NAMES.form}
        data-testid="AVANSERT_SKJEMA_FOR_BRUKERE_MED_GRADERT_UFOERETRYGD"
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

          {isGradertUfoereAfpToggleEnabled && hasSelectedAFP && (
            <>
              <IntroAFP />

              <Beregningsvalg
                localBeregningsTypeRadio={localBeregningsTypeRadio}
                onChange={handleBeregningsvalgChange}
              />
            </>
          )}

          {showFormFields && (
            <>
              {hasSelectedBeregning && <Divider noMargin />}

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
                  !vilkaarsproeving.vilkaarErOppfylt &&
                  uttaksalder &&
                  localBeregningsTypeRadio === beregningsvalg && (
                    <VilkaarsproevingAlert
                      vilkaarsproeving={vilkaarsproeving}
                      uttaksalder={uttaksalder}
                    />
                  )}
              </div>

              {localBeregningsTypeRadio === 'med_afp' ? (
                localGradertUttak?.grad !== undefined &&
                localGradertUttak.grad !== 100 ? (
                  <>
                    <input
                      type="hidden"
                      form={AVANSERT_FORM_NAMES.form}
                      name={`${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-aar`}
                      value={localGradertUttak.uttaksalder?.aar}
                    />
                    <input
                      type="hidden"
                      form={AVANSERT_FORM_NAMES.form}
                      name={`${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-maaneder`}
                      value={localGradertUttak.uttaksalder?.maaneder}
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="hidden"
                      form={AVANSERT_FORM_NAMES.form}
                      name={`${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`}
                      value={localHeltUttak?.uttaksalder?.aar}
                    />
                    <input
                      type="hidden"
                      form={AVANSERT_FORM_NAMES.form}
                      name={`${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`}
                      value={localHeltUttak?.uttaksalder?.maaneder}
                    />
                  </>
                )
              ) : (
                <div>
                  {localGradertUttak?.grad !== undefined &&
                  localGradertUttak.grad !== 100 ? (
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
                      value={localGradertUttak.uttaksalder}
                      onChange={handleGradertUttaksalderChange}
                      error={gradertUttakAgePickerError}
                      minAlder={brukerensAlderPlus1Maaned}
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
                      minAlder={brukerensAlderPlus1Maaned}
                    />
                  )}

                  <div className={styles.spacer__small} />

                  <ReadMoreOmPensjonsalder
                    ufoeregrad={loependeVedtak.ufoeretrygd.grad}
                    isEndring={isEndring}
                  />
                </div>
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
                            id: validationErrors[
                              AVANSERT_FORM_NAMES.uttaksgrad
                            ],
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

                {localBeregningsTypeRadio === 'med_afp' ? (
                  <ReadMore
                    name="Om uttaksgrad"
                    header={intl.formatMessage({
                      id: 'beregning.avansert.rediger.read_more.uttaksgrad.label',
                    })}
                  >
                    <BodyLong data-testid="om-uttaksgrad">
                      <FormattedMessage
                        id="beregning.avansert.rediger.read_more.uttaksgrad.body"
                        values={getFormatMessageValues()}
                      />
                    </BodyLong>
                  </ReadMore>
                ) : (
                  <ReadMore
                    name="Om uttaksgrad"
                    header={intl.formatMessage({
                      id: 'beregning.avansert.rediger.read_more.uttaksgrad.gradert_ufoeretrygd.label',
                    })}
                  >
                    <BodyLong data-testid="om-uttaksgrad-og-ufoeretrygd">
                      <FormattedMessage
                        id={
                          isEndring
                            ? 'omufoeretrygd.readmore.endring.ingress'
                            : 'beregning.avansert.rediger.read_more.uttaksgrad.gradert_ufoeretrygd.body'
                        }
                        values={{
                          ...getFormatMessageValues(),
                          normertPensjonsalder: formatertNormertPensjonsalder,
                        }}
                      />
                    </BodyLong>
                  </ReadMore>
                )}
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
                                    AVANSERT_FORM_NAMES
                                      .inntektVsaGradertUttakRadio
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

                      {localGradertUttak.uttaksalder.aar <
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
                              values={getFormatMessageValues()}
                            />
                          </BodyLong>
                        </ReadMore>
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
                        value={localGradertUttak.aarligInntektVsaPensjonBeloep}
                        aria-required="true"
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
                      minAlder={normertPensjonsalder}
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
                        validationErrors[
                          AVANSERT_FORM_NAMES.inntektVsaHeltUttak
                        ]
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
                      value={localHeltUttak.aarligInntektVsaPensjon?.beloep}
                      aria-required="true"
                    />

                    <AgePicker
                      form={AVANSERT_FORM_NAMES.form}
                      name={AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}
                      label={intl.formatMessage({
                        id: 'inntekt.endre_inntekt_vsa_pensjon_modal.agepicker.label',
                      })}
                      value={localHeltUttak.aarligInntektVsaPensjon?.sluttAlder}
                      minAlder={minAlderInntektSluttAlder}
                      maxAlder={DEFAULT_MAX_OPPTJENINGSALDER}
                      onChange={handleInntektVsaHeltUttakSluttAlderChange}
                      error={
                        validationErrors[
                          AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder
                        ]
                          ? `${intl.formatMessage({
                              id: validationErrors[
                                AVANSERT_FORM_NAMES
                                  .inntektVsaHeltUttakSluttAlder
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
                hasVilkaarIkkeOppfylt={
                  vilkaarsproeving?.vilkaarErOppfylt === false
                }
              />
            </>
          )}
        </div>
      </div>
    </>
  )
}
