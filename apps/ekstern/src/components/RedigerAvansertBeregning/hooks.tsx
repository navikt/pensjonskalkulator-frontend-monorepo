import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'

import { BeregningContext } from '@/pages/Beregning/context'
import { getFormatMessageValues } from '@/utils/translations'

import { FORM_NAMES } from './utils'

export const useFormLocalState = (initialValues: {
  aarligInntektFoerUttakBeloepFraBrukerSkattBeloep: number | undefined
  aarligInntektFoerUttakBeloepFraBrukerInput: number | null
  uttaksalder: Alder | null
  aarligInntektVsaHelPensjon: AarligInntektVsaPensjon | undefined
  gradertUttaksperiode: GradertUttak | null
}) => {
  const {
    aarligInntektFoerUttakBeloepFraBrukerSkattBeloep,
    aarligInntektFoerUttakBeloepFraBrukerInput,
    uttaksalder,
    aarligInntektVsaHelPensjon,
    gradertUttaksperiode,
  } = initialValues

  const { setHarAvansertSkjemaUnsavedChanges } =
    React.useContext(BeregningContext)

  const [localInntektFremTilUttak, setInntektFremTilUttak] = React.useState<
    number | null
  >(
    aarligInntektFoerUttakBeloepFraBrukerInput
      ? aarligInntektFoerUttakBeloepFraBrukerInput
      : null
  )
  const [localHeltUttak, setHeltUttak] = React.useState<
    RecursivePartial<HeltUttak> | undefined
  >({
    uttaksalder: uttaksalder !== null ? uttaksalder : undefined,
    aarligInntektVsaPensjon: aarligInntektVsaHelPensjon
      ? {
          ...aarligInntektVsaHelPensjon,
          beloep: aarligInntektVsaHelPensjon.beloep,
        }
      : undefined,
  })
  const [localGradertUttak, setGradertUttak] = React.useState<
    | (Omit<RecursivePartial<GradertUttak>, 'aarligInntektVsaPensjonBeloep'> & {
        aarligInntektVsaPensjonBeloep?: string
      })
    | undefined
  >(
    gradertUttaksperiode
      ? {
          ...gradertUttaksperiode,
          aarligInntektVsaPensjonBeloep:
            gradertUttaksperiode.aarligInntektVsaPensjonBeloep
              ? gradertUttaksperiode.aarligInntektVsaPensjonBeloep.toString()
              : undefined,
        }
      : undefined
  )

  React.useEffect(() => {
    const hasInntektFremTilUnntakChanged =
      (aarligInntektFoerUttakBeloepFraBrukerInput !== null &&
        localInntektFremTilUttak !==
          aarligInntektFoerUttakBeloepFraBrukerInput) ||
      (aarligInntektFoerUttakBeloepFraBrukerInput === null &&
        localInntektFremTilUttak !== null &&
        localInntektFremTilUttak !==
          aarligInntektFoerUttakBeloepFraBrukerSkattBeloep)
    const hasGradChanged =
      localGradertUttak?.grad !== gradertUttaksperiode?.grad
    const hasGradertUttaksalderChanged =
      JSON.stringify(localGradertUttak?.uttaksalder) !==
      JSON.stringify(gradertUttaksperiode?.uttaksalder)
    const hasAarligInntektVsaGradertPensjonChanged =
      (localGradertUttak?.aarligInntektVsaPensjonBeloep ?? '') !==
      (gradertUttaksperiode?.aarligInntektVsaPensjonBeloep
        ? gradertUttaksperiode?.aarligInntektVsaPensjonBeloep.toString()
        : '')
    const hasUttaksalderChanged =
      JSON.stringify(localHeltUttak?.uttaksalder) !==
      JSON.stringify(uttaksalder ?? undefined)
    const hasAarligInntektBeloepVsaHelPensjonChanged =
      (localHeltUttak?.aarligInntektVsaPensjon?.beloep ?? 0) !==
      (aarligInntektVsaHelPensjon?.beloep ?? 0)
    const hasAarligInntektSluttAlderVsaHelPensjonChanged =
      JSON.stringify(localHeltUttak?.aarligInntektVsaPensjon?.sluttAlder) !==
      JSON.stringify(aarligInntektVsaHelPensjon?.sluttAlder)

    const updatedHasUnsavedChanges =
      hasInntektFremTilUnntakChanged ||
      hasGradChanged ||
      hasGradertUttaksalderChanged ||
      hasAarligInntektVsaGradertPensjonChanged ||
      hasUttaksalderChanged ||
      hasAarligInntektBeloepVsaHelPensjonChanged ||
      hasAarligInntektSluttAlderVsaHelPensjonChanged

    setHarAvansertSkjemaUnsavedChanges((previous) => {
      return previous !== updatedHasUnsavedChanges
        ? !!updatedHasUnsavedChanges
        : previous
    })
  }, [
    uttaksalder,
    aarligInntektFoerUttakBeloepFraBrukerInput,
    gradertUttaksperiode,
    aarligInntektVsaHelPensjon,
    localInntektFremTilUttak,
    localGradertUttak,
    localHeltUttak,
  ])

  const handlers = React.useMemo(
    () => ({
      setLocalInntektFremTilUttak: setInntektFremTilUttak,
      setLocalHeltUttak: setHeltUttak,
      setLocalGradertUttak: setGradertUttak,
    }),
    []
  )

  return [
    localInntektFremTilUttak,
    localHeltUttak,
    localGradertUttak,
    handlers,
  ] as const
}

export const useFormValidationErrors = (initialValues: { grad?: number }) => {
  const intl = useIntl()

  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({
    [FORM_NAMES.uttaksalderHeltUttak]: '',
    [FORM_NAMES.uttaksalderGradertUttak]: '',
    [FORM_NAMES.inntektVsaGradertUttak]: '',
  })

  const gradertUttakAgePickerError = React.useMemo(() => {
    return validationErrors[FORM_NAMES.uttaksalderGradertUttak] ? (
      <>
        {intl.formatMessage({
          id: validationErrors[FORM_NAMES.uttaksalderGradertUttak],
        })}{' '}
        <FormattedMessage
          id="beregning.avansert.rediger.agepicker.validation_error"
          values={{
            ...getFormatMessageValues(intl),
            grad: initialValues.grad,
          }}
        />
      </>
    ) : (
      ''
    )
  }, [validationErrors, initialValues])

  const heltUttakAgePickerError = React.useMemo(() => {
    return validationErrors[FORM_NAMES.uttaksalderHeltUttak] ? (
      <>
        {intl.formatMessage({
          id: validationErrors[FORM_NAMES.uttaksalderHeltUttak],
        })}{' '}
        {(validationErrors[FORM_NAMES.uttaksalderHeltUttak] ===
          'agepicker.validation_error.aar' ||
          validationErrors[FORM_NAMES.uttaksalderHeltUttak] ===
            'agepicker.validation_error.maaneder') && (
          <FormattedMessage
            id="beregning.avansert.rediger.agepicker.validation_error"
            values={{ ...getFormatMessageValues(intl), grad: 100 }}
          />
        )}
      </>
    ) : (
      ''
    )
  }, [validationErrors, initialValues])

  const handlers = React.useMemo(
    () => ({
      setValidationErrors: setValidationErrors,
      setValidationErrorUttaksalderHeltUttak: (s: string) => {
        setValidationErrors((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.uttaksalderHeltUttak]: s,
          }
        })
      },
      setValidationErrorUttaksalderGradertUttak: (s: string) => {
        setValidationErrors((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.uttaksalderGradertUttak]: s,
          }
        })
      },
      setValidationErrorInntektVsaGradertUttak: (s: string) => {
        setValidationErrors((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.inntektVsaGradertUttak]: s,
          }
        })
      },
      resetValidationErrors: () => {
        setValidationErrors(() => {
          return {
            [FORM_NAMES.uttaksalderHeltUttak]: '',
            [FORM_NAMES.uttaksalderGradertUttak]: '',
            [FORM_NAMES.inntektVsaGradertUttak]: '',
          }
        })
      },
    }),
    []
  )

  return [
    validationErrors,
    gradertUttakAgePickerError,
    heltUttakAgePickerError,
    handlers,
  ] as const
}
