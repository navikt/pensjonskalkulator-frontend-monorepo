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
// import { EndreInntektVsaPensjon } from '@/components/EndreInntektVsaPensjon'
import { VilkaarsproevingAlert } from '@/components/VilkaarsproevingAlert'
import { BeregningContext } from '@/pages/Beregning/context'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectAarligInntektFoerUttakBeloep,
  selectAarligInntektFoerUttakBeloepFraSkatt,
  selectAarligInntektFoerUttakBeloepFraBrukerInput,
} from '@/state/userInput/selectors'
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

  const [
    localInntektFremTilUttak,
    localHeltUttak,
    localHarInntektVsaHeltUttakRadio,
    localGradertUttak,
    localHarInntektVsaGradertUttakRadio,
    {
      setLocalInntektFremTilUttak,
      setLocalHeltUttak,
      setLocalGradertUttak,
      setLocalHarInntektVsaHeltUttakRadio,
      setLocalHarInntektVsaGradertUttakRadio,
    },
  ] = useFormLocalState({
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
      setValidationErrorInntektVsaHeltUttakRadio,
      setValidationErrorUttaksalderGradertUttak,
      setValidationErrorInntektVsaGradertUttakRadio,
      setValidationErrorInntektVsaGradertUttak,
      resetValidationErrors,
    },
  ] = useFormValidationErrors({
    grad: localGradertUttak?.grad,
  })

  const handleUttaksgradChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    resetValidationErrors()
    const avansertBeregningFormatertUttaksgradAsNumber = e.target.value
      ? parseInt(e.target.value.match(/\d+/)?.[0] as string, 10)
      : 100

    if (
      !isNaN(avansertBeregningFormatertUttaksgradAsNumber) &&
      avansertBeregningFormatertUttaksgradAsNumber !== localGradertUttak?.grad
    ) {
      // if the avansertBeregningFormatertUttaksgradAsNumber is different than 100
      if (avansertBeregningFormatertUttaksgradAsNumber !== 100) {
        // if there was no gradert uttak, empty the value for helt
        if (localGradertUttak?.uttaksalder === undefined) {
          setLocalHeltUttak((previous) => {
            return {
              ...previous,
              uttaksalder: undefined,
            }
          })
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
      } else {
        // transfer the value from gradert age picker to helt age picker
        setLocalHeltUttak((previous) => {
          return {
            ...previous,
            uttaksalder: localGradertUttak?.uttaksalder,
          }
        })

        // empty the values for gradert
        setLocalGradertUttak(undefined)
      }
    }
  }

  const handleInntektVsaHeltUttakRadioChange = (s: BooleanRadio) => {
    setLocalHarInntektVsaHeltUttakRadio(s === 'ja' ? true : false)
    setValidationErrorInntektVsaHeltUttakRadio('')
  }

  const handleInntektVsaGradertUttakRadioChange = (s: BooleanRadio) => {
    setLocalHarInntektVsaGradertUttakRadio(s === 'ja' ? true : false)
    setValidationErrorInntektVsaGradertUttakRadio('')
  }

  const handleInntektVsaGradertPensjonChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setLocalGradertUttak((previous) => ({
      ...previous,
      aarligInntektVsaPensjonBeloep: e.target.value
        ? e.target.value
        : undefined,
    }))
    setValidationErrorInntektVsaGradertUttak('')
  }

  const handleGradertUttaksalderChange = (
    alder: Partial<Alder> | undefined
  ) => {
    setValidationErrorUttaksalderGradertUttak('')
    setLocalGradertUttak((previous) => ({
      ...previous,
      uttaksalder: alder,
    }))
  }

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
                localHeltUttak,
                localInntektFremTilUttak,
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
              id: 'inntekt.info_om_inntekt.read_more',
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
          {localGradertUttak ? (
            <AgePicker
              form={FORM_NAMES.form}
              name={FORM_NAMES.uttaksalderGradertUttak}
              label={<FormattedMessage id="velguttaksalder.title" />}
              value={localGradertUttak?.uttaksalder}
              onChange={handleGradertUttaksalderChange}
              error={gradertUttakAgePickerError}
            />
          ) : (
            <AgePicker
              form={FORM_NAMES.form}
              name={FORM_NAMES.uttaksalderHeltUttak}
              label={<FormattedMessage id="velguttaksalder.title" />}
              value={localHeltUttak?.uttaksalder}
              onChange={handleHeltUttaksalderChange}
              error={heltUttakAgePickerError}
            />
          )}
          <div className={styles.spacer__small} />
          <ReadMoreOmPensjonsalder />
        </div>
        <div>
          <Select
            form={FORM_NAMES.form}
            data-testid="uttaksgrad-select"
            name={FORM_NAMES.uttaksgrad}
            className={styles.select}
            label={intl.formatMessage({
              id: 'beregning.avansert.rediger.uttaksgrad.label',
            })}
            description={intl.formatMessage({
              id: 'beregning.avansert.rediger.uttaksgrad.description',
            })}
            value={
              localGradertUttak?.grad ? `${localGradertUttak.grad} %` : '100 %'
            }
            onChange={handleUttaksgradChange}
          >
            <option>
              <FormattedMessage id="beregning.avansert.rediger.uttaksgrad.description" />
            </option>
            {['20 %', '40 %', '50 %', '60 %', '80 %', '100 %'].map((grad) => (
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
            <BodyLong>
              <FormattedMessage
                id="beregning.avansert.rediger.read_more.uttaksgrad.body"
                values={{
                  ...getFormatMessageValues(intl),
                }}
              />
            </BodyLong>
          </ReadMore>
        </div>
        {localGradertUttak && (
          <>
            <div>
              <RadioGroup
                legend={
                  <FormattedMessage
                    id="beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak"
                    values={{ grad: localGradertUttak.grad }}
                  />
                }
                description={
                  <FormattedMessage id="beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak.description" />
                }
                name={FORM_NAMES.inntektVsaGradertUttakRadio}
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
                    ? intl.formatMessage({
                        id: validationErrors[
                          FORM_NAMES.inntektVsaGradertUttakRadio
                        ],
                      })
                    : ''
                }
                role="radiogroup"
                aria-required="true"
              >
                <Radio form={FORM_NAMES.form} value="ja">
                  <FormattedMessage id="stegvisning.radio_ja" />
                </Radio>
                <Radio form={FORM_NAMES.form} value="nei">
                  <FormattedMessage id="stegvisning.radio_nei" />
                </Radio>
              </RadioGroup>
            </div>

            {localHarInntektVsaGradertUttakRadio && (
              <div>
                <TextField
                  form={FORM_NAMES.form}
                  data-testid="inntekt-vsa-gradert-pensjon-textfield"
                  type="text"
                  inputMode="numeric"
                  name={FORM_NAMES.inntektVsaGradertUttak}
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
                      ? intl.formatMessage({
                          id: validationErrors[
                            FORM_NAMES.inntektVsaGradertUttak
                          ],
                        })
                      : ''
                  }
                  onChange={handleInntektVsaGradertPensjonChange}
                  value={localGradertUttak?.aarligInntektVsaPensjonBeloep}
                  max={5}
                  aria-required="true"
                />
              </div>
            )}
            <Divider noMargin />
            <div>
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
              />
            </div>
          </>
        )}

        {localHeltUttak?.uttaksalder?.aar &&
          localHeltUttak?.uttaksalder?.maaneder !== undefined && (
            <div>
              <RadioGroup
                legend={
                  <FormattedMessage id="beregning.avansert.rediger.radio.inntekt_vsa_helt_uttak" />
                }
                description={
                  <FormattedMessage id="beregning.avansert.rediger.radio.inntekt_vsa_helt_uttak.description" />
                }
                name={FORM_NAMES.inntektVsaHeltUttakRadio}
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
                    ? intl.formatMessage({
                        id: validationErrors[
                          FORM_NAMES.inntektVsaHeltUttakRadio
                        ],
                      })
                    : ''
                }
                role="radiogroup"
                aria-required="true"
              >
                <Radio form={FORM_NAMES.form} value="ja">
                  <FormattedMessage id="stegvisning.radio_ja" />
                </Radio>
                <Radio form={FORM_NAMES.form} value="nei">
                  <FormattedMessage id="stegvisning.radio_nei" />
                </Radio>
              </RadioGroup>
            </div>
          )}

        {localHeltUttak?.uttaksalder?.aar &&
          localHeltUttak?.uttaksalder?.maaneder !== undefined &&
          localHarInntektVsaHeltUttakRadio && (
            <div>Her kommer input og AgePicker fra EndreInntektVsaPensjon</div>
          )}

        {/* {localHeltUttak?.uttaksalder?.aar &&
          localHeltUttak?.uttaksalder?.maaneder !== undefined && (
            <div>
              <div className={`${styles.spacer} ${styles.spacer__small}`} />
              <EndreInntektVsaPensjon
                uttaksperiode={localHeltUttak}
                oppdatereInntekt={(aarligInntektVsaPensjon?: {
                  beloep: number
                  sluttAlder: {
                    aar: number
                    maaneder: number
                  }
                }) => {
                  setLocalHeltUttak((prevState) => {
                    return {
                      ...prevState,
                      aarligInntektVsaPensjon,
                    }
                  })
                }}
              />
            </div>
          )} */}
        <FormButtonRow
          resetForm={resetForm}
          gaaTilResultat={gaaTilResultat}
          hasVilkaarIkkeOppfylt={vilkaarsproeving?.vilkaarErOppfylt === false}
        />
      </div>
    </div>
  )
}
