import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'

import {
  BodyLong,
  Label,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from '@navikt/ds-react'

import { AgePicker } from '@/components/common/AgePicker'
import { Divider } from '@/components/common/Divider'
import { ReadMore } from '@/components/common/ReadMore'
import { EndreInntekt } from '@/components/EndreInntekt'
import { InfoOmInntekt } from '@/components/EndreInntekt/InfoOmInntekt'
import { VilkaarsproevingAlert } from '@/components/VilkaarsproevingAlert'
import { BeregningContext } from '@/pages/Beregning/context'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectUfoeregrad,
  selectCurrentSimulation,
  selectAarligInntektFoerUttakBeloep,
  selectAarligInntektFoerUttakBeloepFraSkatt,
  selectAarligInntektFoerUttakBeloepFraBrukerInput,
} from '@/state/userInput/selectors'
import {
  DEFAULT_MAX_OPPTJENINGSALDER,
  DEFAULT_UBETINGET_UTTAKSALDER,
} from '@/utils/alder'
import { formatInntekt } from '@/utils/inntekt'
import { getFormatMessageValues } from '@/utils/translations'

import { FormButtonRow } from './FormButtonRow'
import { useFormLocalState, useFormValidationErrors } from './hooks'
import { ReadMoreOmPensjonsalder } from './ReadMoreOmPensjonsalder'
import { FORM_NAMES, onAvansertBeregningSubmit } from './utils'

import styles from './RedigerAvansertBeregning.module.scss'

export const RedigerAvansertBeregning: React.FC<{
  gaaTilResultat: () => void
  vilkaarsproeving?: Vilkaarsproeving
}> = ({ gaaTilResultat, vilkaarsproeving }) => {
  const intl = useIntl()
  const dispatch = useAppDispatch()

  const ufoeregrad = useAppSelector(selectUfoeregrad)
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
  const { harAvansertSkjemaUnsavedChanges } = React.useContext(BeregningContext)

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
    ufoeregrad,
    aarligInntektFoerUttakBeloepFraBrukerSkattBeloep:
      aarligInntektFoerUttakBeloepFraBrukerSkatt?.beloep,
    aarligInntektFoerUttakBeloepFraBrukerInput,
    uttaksalder,
    aarligInntektVsaHelPensjon,
    gradertUttaksperiode,
  })

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
  // TODO PEK-396 skrive test for håndtering av shouldResetGradertUttak
  const handleGradertUttaksalderChange = (
    alder: Partial<Alder> | undefined
  ) => {
    // Dersom brukeren har uføregrad og endrer alderen til en alder som tillater flere graderinger, skal gradert uttak nullstilles
    const shouldResetGradertUttak =
      ufoeregrad &&
      ufoeregrad !== 100 &&
      alder?.aar &&
      alder?.maaneder !== undefined &&
      (alder?.aar > DEFAULT_UBETINGET_UTTAKSALDER.aar ||
        (alder?.aar === DEFAULT_UBETINGET_UTTAKSALDER.aar &&
          alder?.maaneder > 0))

    setValidationErrorUttaksalderGradertUttak('')
    if (shouldResetGradertUttak) {
      // Overførter verdien tilbake til helt uttak
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
        [FORM_NAMES.uttaksgrad]: '',
        [FORM_NAMES.uttaksalderGradertUttak]: '',
        [FORM_NAMES.inntektVsaGradertUttakRadio]: '',
        [FORM_NAMES.inntektVsaGradertUttak]: '',
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
    setLocalHarInntektVsaHeltUttakRadio(s === 'ja' ? true : false)
    setValidationErrors({
      [FORM_NAMES.inntektVsaHeltUttakRadio]: '',
      [FORM_NAMES.inntektVsaHeltUttak]: '',
      [FORM_NAMES.inntektVsaHeltUttakSluttAlder]: '',
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
    setLocalHarInntektVsaGradertUttakRadio(s === 'ja' ? true : false)
    setValidationErrors({
      [FORM_NAMES.inntektVsaGradertUttakRadio]: '',
      [FORM_NAMES.inntektVsaGradertUttak]: '',
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
    setValidationErrorInntektVsaHeltUttak('')
    setLocalHeltUttak((previous) => ({
      ...previous,
      aarligInntektVsaPensjon: {
        ...previous?.aarligInntektVsaPensjon,
        beloep: e.target.value ? formatInntekt(e.target.value) : undefined,
      },
    }))
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
    setValidationErrorInntektVsaGradertUttak('')
    setLocalGradertUttak((previous) => ({
      ...previous,
      aarligInntektVsaPensjonBeloep: e.target.value
        ? formatInntekt(e.target.value)
        : undefined,
    }))
  }

  const resetForm = (): void => {
    resetValidationErrors()
    setLocalInntektFremTilUttak(
      aarligInntektFoerUttakBeloepFraBrukerSkatt?.beloep ?? null
    )
    setLocalGradertUttak(undefined)
    setLocalHeltUttak(undefined)
    setLocalHarInntektVsaHeltUttakRadio(null)
  }

  return (
    <div
      className={`${styles.container} ${styles.container__hasMobilePadding}`}
    >
      <div className={styles.form}>
        <form
          id={FORM_NAMES.form}
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
                localInntektFremTilUttak,
                ufoeregrad,
                hasVilkaarIkkeOppfylt:
                  vilkaarsproeving?.vilkaarErOppfylt === false,
                harAvansertSkjemaUnsavedChanges,
              }
            )
          }}
        ></form>
        <div>
          <Label className={styles.label}>
            <FormattedMessage id="beregning.avansert.rediger.inntekt_frem_til_uttak.label" />
          </Label>
          <div className={styles.description}>
            <span className={styles.descriptionText}>
              <span
                className="nowrap"
                data-testid="formatert-inntekt-frem-til-uttak"
              >
                {formatInntekt(
                  localInntektFremTilUttak !== null
                    ? localInntektFremTilUttak
                    : aarligInntektFoerUttakBeloep
                )}
              </span>
              {` ${intl.formatMessage({ id: 'beregning.avansert.rediger.inntekt_frem_til_uttak.description' })}`}
            </span>
            <EndreInntekt
              visning="avansert"
              buttonLabel="beregning.avansert.rediger.inntekt.button"
              value={localInntektFremTilUttak}
              onSubmit={(uformatertInntekt) => {
                setLocalInntektFremTilUttak(formatInntekt(uformatertInntekt))
              }}
            />
          </div>
          <div className={`${styles.spacer} ${styles.spacer__small}`} />
          <ReadMore
            name="Endring av inntekt i avansert fane"
            header={intl.formatMessage({
              id: 'inntekt.info_om_inntekt.read_more.label',
            })}
          >
            <InfoOmInntekt />
          </ReadMore>
        </div>
        <Divider noMargin />
        {vilkaarsproeving &&
          !vilkaarsproeving?.vilkaarErOppfylt &&
          uttaksalder && (
            <VilkaarsproevingAlert
              vilkaarsproeving={vilkaarsproeving}
              uttaksalder={uttaksalder}
            />
          )}
        <div>
          {
            // TODO PEK-396 skrive tester for begrensing av alder ved uføregrad === 100
          }
          {localGradertUttak?.grad && localGradertUttak?.grad !== 100 ? (
            <AgePicker
              form={FORM_NAMES.form}
              name={FORM_NAMES.uttaksalderGradertUttak}
              label={<FormattedMessage id="velguttaksalder.title" />}
              value={localGradertUttak?.uttaksalder}
              onChange={handleGradertUttaksalderChange}
              error={gradertUttakAgePickerError}
              minAlder={
                ufoeregrad === 100 ? DEFAULT_UBETINGET_UTTAKSALDER : undefined
              }
            />
          ) : (
            <AgePicker
              form={FORM_NAMES.form}
              name={FORM_NAMES.uttaksalderHeltUttak}
              label={<FormattedMessage id="velguttaksalder.title" />}
              value={localHeltUttak?.uttaksalder}
              onChange={handleHeltUttaksalderChange}
              error={heltUttakAgePickerError}
              minAlder={
                ufoeregrad === 100 ? DEFAULT_UBETINGET_UTTAKSALDER : undefined
              }
            />
          )}
          <div className={styles.spacer__small} />
          <ReadMoreOmPensjonsalder ufoeregrad={ufoeregrad} />
        </div>
        <div>
          <Select
            form={FORM_NAMES.form}
            name={FORM_NAMES.uttaksgrad}
            data-testid={FORM_NAMES.uttaksgrad}
            className={styles.select}
            label={intl.formatMessage({
              id: 'beregning.avansert.rediger.uttaksgrad.label',
            })}
            description={intl.formatMessage({
              id: 'beregning.avansert.rediger.uttaksgrad.description',
            })}
            value={localGradertUttak?.grad ? `${localGradertUttak.grad} %` : ''}
            onChange={handleUttaksgradChange}
            error={
              validationErrors[FORM_NAMES.uttaksgrad]
                ? intl.formatMessage(
                    {
                      id: validationErrors[FORM_NAMES.uttaksgrad],
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
            {muligeUttaksgrad.map((grad) => (
              <option key={grad} value={grad}>
                {grad}
              </option>
            ))}
          </Select>
          <div className={styles.spacer__small} />
          {
            // TODO PEK-396 skrive tester for ulike readmore i tilfelle brukeren har uføretrygd
          }
          <ReadMore
            name="Om uttaksgrad"
            header={intl.formatMessage({
              id: ufoeregrad
                ? 'beregning.avansert.rediger.read_more.uttaksgrad.ufoeretrygd.label'
                : 'beregning.avansert.rediger.read_more.uttaksgrad.label',
            })}
          >
            <BodyLong>
              <FormattedMessage
                id={
                  ufoeregrad
                    ? 'beregning.avansert.rediger.read_more.uttaksgrad.ufoeretrygd.body'
                    : 'beregning.avansert.rediger.read_more.uttaksgrad.body'
                }
                values={{
                  ...getFormatMessageValues(intl),
                }}
              />
            </BodyLong>
          </ReadMore>
        </div>
        {localGradertUttak?.uttaksalder?.aar &&
          localGradertUttak?.uttaksalder?.maaneder !== undefined &&
          localGradertUttak?.grad &&
          localGradertUttak.grad !== 100 && (
            <>
              <div>
                <RadioGroup
                  legend={
                    <FormattedMessage
                      id="beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak"
                      values={{
                        ...getFormatMessageValues(intl),
                        grad: localGradertUttak.grad,
                      }}
                    />
                  }
                  // TODO PEK-396 skrive tester for ulike readmore i tilfelle brukeren har gradert uføretrygd og valgt alder < 67
                  description={
                    <FormattedMessage
                      id={
                        ufoeregrad &&
                        localGradertUttak.uttaksalder.aar <
                          DEFAULT_UBETINGET_UTTAKSALDER.aar
                          ? 'beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak.ufoeretrygd.description'
                          : 'beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak.description'
                      }
                    />
                  }
                  name={FORM_NAMES.inntektVsaGradertUttakRadio}
                  data-testid={FORM_NAMES.inntektVsaGradertUttakRadio}
                  value={
                    localHarInntektVsaGradertUttakRadio === null
                      ? null
                      : localHarInntektVsaGradertUttakRadio
                        ? 'ja'
                        : 'nei'
                  }
                  onChange={handleInntektVsaGradertUttakRadioChange}
                  error={
                    validationErrors[FORM_NAMES.inntektVsaGradertUttakRadio]
                      ? intl.formatMessage(
                          {
                            id: validationErrors[
                              FORM_NAMES.inntektVsaGradertUttakRadio
                            ],
                          },
                          {
                            ...getFormatMessageValues(intl),
                            grad: localGradertUttak.grad,
                          }
                        )
                      : ''
                  }
                  role="radiogroup"
                  aria-required="true"
                >
                  <Radio
                    form={FORM_NAMES.form}
                    data-testid={`${FORM_NAMES.inntektVsaGradertUttakRadio}-ja`}
                    value="ja"
                    aria-invalid={
                      !!validationErrors[FORM_NAMES.inntektVsaGradertUttakRadio]
                    }
                  >
                    <FormattedMessage id="stegvisning.radio_ja" />
                  </Radio>
                  <Radio
                    form={FORM_NAMES.form}
                    data-testid={`${FORM_NAMES.inntektVsaGradertUttakRadio}-nei`}
                    value="nei"
                  >
                    <FormattedMessage id="stegvisning.radio_nei" />
                  </Radio>
                </RadioGroup>
                {
                  // TODO PEK-396 skrive tester for ulike readmore i tilfelle brukeren har gradert uføretrygd og valgt alder < 67
                }
                {ufoeregrad &&
                  localGradertUttak.uttaksalder.aar <
                    DEFAULT_UBETINGET_UTTAKSALDER.aar && (
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
                            ...getFormatMessageValues(intl),
                          }}
                        />
                      </BodyLong>
                    </ReadMore>
                  )}
              </div>

              {localHarInntektVsaGradertUttakRadio && (
                <div>
                  <TextField
                    form={FORM_NAMES.form}
                    name={FORM_NAMES.inntektVsaGradertUttak}
                    data-testid={FORM_NAMES.inntektVsaGradertUttak}
                    type="text"
                    inputMode="numeric"
                    className={styles.textfield}
                    label={
                      <FormattedMessage
                        id="beregning.avansert.rediger.inntekt_vsa_gradert_uttak.label"
                        values={{
                          ...getFormatMessageValues(intl),
                          grad: localGradertUttak.grad,
                        }}
                      />
                    }
                    description={intl.formatMessage({
                      id: 'inntekt.endre_inntekt_modal.textfield.description',
                    })}
                    error={
                      validationErrors[FORM_NAMES.inntektVsaGradertUttak]
                        ? intl.formatMessage(
                            {
                              id: validationErrors[
                                FORM_NAMES.inntektVsaGradertUttak
                              ],
                            },
                            {
                              ...getFormatMessageValues(intl),
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
                {
                  // TODO PEK-396 skrive tester for begrensing av alder ved uføregrad === 100
                }
                <AgePicker
                  form={FORM_NAMES.form}
                  name={FORM_NAMES.uttaksalderHeltUttak}
                  label={
                    <FormattedMessage
                      id="beregning.avansert.rediger.heltuttak.agepicker.label"
                      values={{
                        ...getFormatMessageValues(intl),
                      }}
                    />
                  }
                  value={localHeltUttak?.uttaksalder}
                  onChange={handleHeltUttaksalderChange}
                  error={heltUttakAgePickerError}
                  minAlder={
                    ufoeregrad ? DEFAULT_UBETINGET_UTTAKSALDER : undefined
                  }
                />
              </div>
            </>
          )}

        {localHeltUttak?.uttaksalder?.aar &&
          localHeltUttak?.uttaksalder?.maaneder !== undefined &&
          localGradertUttak?.grad && (
            <div>
              <RadioGroup
                legend={
                  <FormattedMessage
                    id="beregning.avansert.rediger.radio.inntekt_vsa_helt_uttak"
                    values={{ ...getFormatMessageValues(intl) }}
                  />
                }
                description={
                  <FormattedMessage id="beregning.avansert.rediger.radio.inntekt_vsa_helt_uttak.description" />
                }
                name={FORM_NAMES.inntektVsaHeltUttakRadio}
                data-testid={FORM_NAMES.inntektVsaHeltUttakRadio}
                value={
                  localHarInntektVsaHeltUttakRadio === null
                    ? null
                    : localHarInntektVsaHeltUttakRadio
                      ? 'ja'
                      : 'nei'
                }
                onChange={handleInntektVsaHeltUttakRadioChange}
                error={
                  validationErrors[FORM_NAMES.inntektVsaHeltUttakRadio]
                    ? intl.formatMessage(
                        {
                          id: validationErrors[
                            FORM_NAMES.inntektVsaHeltUttakRadio
                          ],
                        },
                        { ...getFormatMessageValues(intl) }
                      )
                    : ''
                }
                role="radiogroup"
                aria-required="true"
              >
                <Radio
                  form={FORM_NAMES.form}
                  data-testid={`${FORM_NAMES.inntektVsaHeltUttakRadio}-ja`}
                  value="ja"
                  aria-invalid={
                    !!validationErrors[FORM_NAMES.inntektVsaHeltUttakRadio]
                  }
                >
                  <FormattedMessage id="stegvisning.radio_ja" />
                </Radio>
                <Radio
                  form={FORM_NAMES.form}
                  data-testid={`${FORM_NAMES.inntektVsaHeltUttakRadio}-nei`}
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
                  form={FORM_NAMES.form}
                  name={FORM_NAMES.inntektVsaHeltUttak}
                  data-testid={FORM_NAMES.inntektVsaHeltUttak}
                  type="text"
                  inputMode="numeric"
                  className={styles.textfield}
                  label={
                    <FormattedMessage
                      id="inntekt.endre_inntekt_vsa_pensjon_modal.textfield.label"
                      values={{ ...getFormatMessageValues(intl) }}
                    />
                  }
                  description={intl.formatMessage({
                    id: 'inntekt.endre_inntekt_vsa_pensjon_modal.textfield.description',
                  })}
                  error={
                    validationErrors[FORM_NAMES.inntektVsaHeltUttak]
                      ? intl.formatMessage(
                          {
                            id: validationErrors[
                              FORM_NAMES.inntektVsaHeltUttak
                            ],
                          },
                          { ...getFormatMessageValues(intl) }
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
                  form={FORM_NAMES.form}
                  name={FORM_NAMES.inntektVsaHeltUttakSluttAlder}
                  label={intl.formatMessage({
                    id: 'inntekt.endre_inntekt_vsa_pensjon_modal.agepicker.label',
                  })}
                  value={localHeltUttak?.aarligInntektVsaPensjon?.sluttAlder}
                  minAlder={minAlderInntektSluttAlder}
                  maxAlder={DEFAULT_MAX_OPPTJENINGSALDER}
                  onChange={handleInntektVsaHeltUttakSluttAlderChange}
                  error={
                    validationErrors[FORM_NAMES.inntektVsaHeltUttakSluttAlder]
                      ? `${intl.formatMessage({
                          id: validationErrors[
                            FORM_NAMES.inntektVsaHeltUttakSluttAlder
                          ],
                        })}.`
                      : ''
                  }
                />
              </div>
            </>
          )}
        <FormButtonRow
          resetForm={resetForm}
          gaaTilResultat={gaaTilResultat}
          hasVilkaarIkkeOppfylt={vilkaarsproeving?.vilkaarErOppfylt === false}
        />
      </div>
    </div>
  )
}
