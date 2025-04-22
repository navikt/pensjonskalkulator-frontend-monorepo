/* eslint-disable react/hook-use-state */
import React, { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BeregningContext } from '@/pages/Beregning/context'
import { getFormatMessageValues } from '@/utils/translations'
import { ALLE_UTTAKSGRAD_AS_NUMBER } from '@/utils/uttaksgrad'

import { AVANSERT_FORM_NAMES, AvansertFormNames } from './utils'

interface UseFormLocalStateProps {
  isEndring: boolean
  ufoeregrad: number
  aarligInntektFoerUttakBeloepFraBrukerSkattBeloep: string | undefined
  aarligInntektFoerUttakBeloepFraBrukerInput: string | null
  uttaksalder: Alder | null
  aarligInntektVsaHelPensjon: AarligInntektVsaPensjon | undefined
  gradertUttaksperiode: GradertUttak | null
  normertPensjonsalder: Alder
  beregningsvalg: Beregningsvalg | null
}

export const useFormLocalState = ({
  isEndring,
  ufoeregrad,
  aarligInntektFoerUttakBeloepFraBrukerSkattBeloep,
  aarligInntektFoerUttakBeloepFraBrukerInput,
  uttaksalder,
  aarligInntektVsaHelPensjon,
  gradertUttaksperiode,
  normertPensjonsalder,
  beregningsvalg,
}: UseFormLocalStateProps) => {
  const { setHarAvansertSkjemaUnsavedChanges } =
    React.useContext(BeregningContext)

  const [localBeregningsTypeRadio, setBeregningsTypeRadio] =
    useState<Beregningsvalg | null>(beregningsvalg)

  const [localHarInntektVsaHeltUttakRadio, setHarInntektVsaHeltUttakRadio] =
    useState<boolean | null>(
      !uttaksalder ? null : aarligInntektVsaHelPensjon ? true : false
    )

  const [
    localHarInntektVsaGradertUttakRadio,
    setHarInntektVsaGradertUttakRadio,
  ] = useState<boolean | null>(
    !uttaksalder || !gradertUttaksperiode?.uttaksalder
      ? null
      : gradertUttaksperiode?.aarligInntektVsaPensjonBeloep
        ? true
        : false
  )

  const [localInntektFremTilUttak, setInntektFremTilUttak] = useState<
    string | null
  >(aarligInntektFoerUttakBeloepFraBrukerInput ?? null)
  const [localHeltUttak, setHeltUttak] = useState<
    RecursivePartial<HeltUttak> | undefined
  >({
    uttaksalder: uttaksalder ?? undefined,
    aarligInntektVsaPensjon: aarligInntektVsaHelPensjon,
  })
  const [localGradertUttak, setGradertUttak] = useState<
    RecursivePartial<GradertUttak> | undefined
  >({
    grad:
      gradertUttaksperiode?.grad !== undefined
        ? gradertUttaksperiode.grad
        : uttaksalder
          ? 100
          : undefined,
    uttaksalder: gradertUttaksperiode?.uttaksalder
      ? {
          ...gradertUttaksperiode.uttaksalder,
        }
      : undefined,
    aarligInntektVsaPensjonBeloep:
      gradertUttaksperiode?.aarligInntektVsaPensjonBeloep
        ? gradertUttaksperiode.aarligInntektVsaPensjonBeloep.toString()
        : undefined,
  })

  const minAlderInntektSluttAlder = React.useMemo(
    () =>
      localHeltUttak?.uttaksalder?.aar
        ? {
            aar:
              localHeltUttak?.uttaksalder?.maaneder === 11
                ? localHeltUttak?.uttaksalder?.aar + 1
                : localHeltUttak?.uttaksalder?.aar,
            maaneder:
              localHeltUttak?.uttaksalder?.maaneder !== undefined &&
              localHeltUttak?.uttaksalder?.maaneder !== 11
                ? localHeltUttak?.uttaksalder?.maaneder + 1
                : 0,
          }
        : undefined,
    [localHeltUttak]
  )

  const muligeUttaksgrad = React.useMemo(() => {
    // Hvis uttaksalder for gradert ikke eksisterer, ta utgangspunkt i helt uttaksalder
    // Hvis uttaksalder for gradert eksisterer, ta utgangspunkt i denne
    const valgtAlder =
      localGradertUttak?.uttaksalder?.aar &&
      localGradertUttak?.uttaksalder?.maaneder !== undefined
        ? { ...localGradertUttak?.uttaksalder }
        : { ...localHeltUttak?.uttaksalder }
    const filtrerteUttaksgrad = isEndring
      ? [...ALLE_UTTAKSGRAD_AS_NUMBER]
      : [...ALLE_UTTAKSGRAD_AS_NUMBER].slice(1)

    if (
      valgtAlder?.aar &&
      valgtAlder?.maaneder !== undefined &&
      localBeregningsTypeRadio !== 'med_afp' &&
      ufoeregrad &&
      ufoeregrad !== 100 &&
      valgtAlder?.aar < normertPensjonsalder.aar
    ) {
      const maksGrad = 100 - ufoeregrad
      const avgrensetUttaksgrad = [...filtrerteUttaksgrad].filter(
        (grad) => grad <= maksGrad
      )
      // hvis ingen grad var valgt, eller at en grad var valgt og at den er gyldig, return avgrenset grad
      if (
        localGradertUttak?.grad === undefined ||
        (localGradertUttak?.grad !== undefined &&
          avgrensetUttaksgrad.includes(localGradertUttak?.grad))
      ) {
        return avgrensetUttaksgrad.map((grad) => `${grad} %`)
      }
    }
    return filtrerteUttaksgrad.map((grad) => `${grad} %`)
  }, [ufoeregrad, localBeregningsTypeRadio, localGradertUttak, localHeltUttak])

  React.useEffect(() => {
    const hasBeregningsvalgChanged = beregningsvalg !== localBeregningsTypeRadio
    const hasInntektFremTilUnntakChanged =
      (aarligInntektFoerUttakBeloepFraBrukerInput !== null &&
        localInntektFremTilUttak !==
          aarligInntektFoerUttakBeloepFraBrukerInput) ||
      (aarligInntektFoerUttakBeloepFraBrukerInput === null &&
        localInntektFremTilUttak !== null &&
        localInntektFremTilUttak !==
          aarligInntektFoerUttakBeloepFraBrukerSkattBeloep)
    const hasGradChanged =
      (localGradertUttak?.grad ?? 100) !== (gradertUttaksperiode?.grad ?? 100)
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
      hasBeregningsvalgChanged ||
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
    beregningsvalg,
    uttaksalder,
    aarligInntektFoerUttakBeloepFraBrukerInput,
    gradertUttaksperiode,
    aarligInntektVsaHelPensjon,
    localBeregningsTypeRadio,
    localInntektFremTilUttak,
    localGradertUttak,
    localHeltUttak,
  ])

  const handlers = React.useMemo(
    () => ({
      setLocalInntektFremTilUttak: setInntektFremTilUttak,
      setLocalHeltUttak: setHeltUttak,
      setLocalGradertUttak: setGradertUttak,
      setLocalHarInntektVsaHeltUttakRadio: setHarInntektVsaHeltUttakRadio,
      setLocalHarInntektVsaGradertUttakRadio: setHarInntektVsaGradertUttakRadio,
      setLocalBeregningsTypeRadio: setBeregningsTypeRadio,
    }),
    []
  )

  return [
    localInntektFremTilUttak,
    localHeltUttak,
    localHarInntektVsaHeltUttakRadio,
    localGradertUttak,
    localHarInntektVsaGradertUttakRadio,
    minAlderInntektSluttAlder,
    muligeUttaksgrad,
    handlers,
    localBeregningsTypeRadio,
  ] as const
}

export const useFormValidationErrors = (initialValues: { grad?: number }) => {
  const intl = useIntl()

  const [validationErrors, setValidationErrors] = useState<
    Record<AvansertFormNames, string>
  >({
    [AVANSERT_FORM_NAMES.uttaksalderHeltUttak]: '',
    [AVANSERT_FORM_NAMES.uttaksalderGradertUttak]: '',
    [AVANSERT_FORM_NAMES.inntektVsaGradertUttak]: '',
  })

  React.useEffect(() => {
    const ariaInvalidElements = document.querySelectorAll(
      'input[aria-invalid]:not([aria-invalid="false"]), select[aria-invalid]:not([aria-invalid="false"])'
    )

    if (
      document.activeElement?.tagName === 'BUTTON' &&
      ariaInvalidElements.length > 0
    ) {
      ;(ariaInvalidElements[0] as HTMLElement).focus()
      ;(ariaInvalidElements[0] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [validationErrors])

  const gradertUttakAgePickerError = React.useMemo(() => {
    return validationErrors[AVANSERT_FORM_NAMES.uttaksalderGradertUttak] ? (
      <>
        {intl.formatMessage(
          { id: validationErrors[AVANSERT_FORM_NAMES.uttaksalderGradertUttak] },
          getFormatMessageValues()
        )}
        <FormattedMessage
          id="beregning.avansert.rediger.agepicker.grad.validation_error"
          values={{
            ...getFormatMessageValues(),
            grad: initialValues.grad,
          }}
        />
      </>
    ) : (
      ''
    )
  }, [validationErrors, initialValues])

  const heltUttakAgePickerError = React.useMemo(() => {
    return validationErrors[AVANSERT_FORM_NAMES.uttaksalderHeltUttak] ? (
      <>
        {intl.formatMessage(
          { id: validationErrors[AVANSERT_FORM_NAMES.uttaksalderHeltUttak] },
          getFormatMessageValues()
        )}
        {(validationErrors[AVANSERT_FORM_NAMES.uttaksalderHeltUttak] ===
          'agepicker.validation_error.aar' ||
          validationErrors[AVANSERT_FORM_NAMES.uttaksalderHeltUttak] ===
            'agepicker.validation_error.maaneder') && (
          <FormattedMessage
            id={
              initialValues.grad !== undefined
                ? 'beregning.avansert.rediger.agepicker.grad.validation_error'
                : 'beregning.avansert.rediger.agepicker.validation_error'
            }
            values={{ ...getFormatMessageValues(), grad: 100 }}
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
            [AVANSERT_FORM_NAMES.uttaksalderHeltUttak]: s,
          }
        })
      },
      setValidationErrorUttaksalderGradertUttak: (s: string) => {
        setValidationErrors((prevState) => {
          return {
            ...prevState,
            [AVANSERT_FORM_NAMES.uttaksalderGradertUttak]: s,
          }
        })
      },
      setValidationErrorInntektVsaHeltUttak: (s: string) => {
        setValidationErrors((prevState) => {
          return {
            ...prevState,
            [AVANSERT_FORM_NAMES.inntektVsaHeltUttak]: s,
          }
        })
      },
      setValidationErrorInntektVsaHeltUttakSluttAlder: (s: string) => {
        setValidationErrors((prevState) => {
          return {
            ...prevState,
            [AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder]: s,
          }
        })
      },
      setValidationErrorInntektVsaGradertUttak: (s: string) => {
        setValidationErrors((prevState) => {
          return {
            ...prevState,
            [AVANSERT_FORM_NAMES.inntektVsaGradertUttak]: s,
          }
        })
      },
      resetValidationErrors: () => {
        setValidationErrors(() => {
          return {
            [AVANSERT_FORM_NAMES.uttaksalderHeltUttak]: '',
            [AVANSERT_FORM_NAMES.uttaksalderGradertUttak]: '',
            [AVANSERT_FORM_NAMES.inntektVsaGradertUttak]: '',
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
