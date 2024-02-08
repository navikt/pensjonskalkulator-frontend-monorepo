import React from 'react'

export const useFormLocalState = (initialValues: {
  aarligInntektFoerUttakBeloepFraBrukerInput: number | null
  uttaksalder: Alder | null
  aarligInntektVsaHelPensjon: AarligInntektVsaPensjon | undefined
  gradertUttaksperiode: GradertUttak | null
}) => {
  const {
    aarligInntektFoerUttakBeloepFraBrukerInput,
    uttaksalder,
    aarligInntektVsaHelPensjon,
    gradertUttaksperiode,
  } = initialValues

  const [localInntektFremTilUttak, setInntektFremTilUttak] = React.useState<
    number | null
  >(
    aarligInntektFoerUttakBeloepFraBrukerInput
      ? aarligInntektFoerUttakBeloepFraBrukerInput
      : null
  )
  const [localHeltUttak, setHeltUttak] = React.useState<
    | (Omit<RecursivePartial<HeltUttak>, 'aarligInntektVsaPensjon'> & {
        aarligInntektVsaPensjon?: {
          beloep: string
          sluttAlder: Alder
        }
      })
    | undefined
  >({
    uttaksalder: uttaksalder !== null ? uttaksalder : undefined,
    aarligInntektVsaPensjon: aarligInntektVsaHelPensjon
      ? {
          ...aarligInntektVsaHelPensjon,
          beloep: aarligInntektVsaHelPensjon.beloep.toString(),
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

  const [isFormUnderUpdate, setIsFormUnderUpdate] = React.useState<
    boolean | null
  >(false)

  React.useEffect(() => {
    const updatedIsFormUnderUpdate =
      uttaksalder &&
      ((aarligInntektFoerUttakBeloepFraBrukerInput !== null &&
        localInntektFremTilUttak !==
          aarligInntektFoerUttakBeloepFraBrukerInput) ||
        (aarligInntektFoerUttakBeloepFraBrukerInput === null &&
          localInntektFremTilUttak !== null) ||
        localGradertUttak?.grad !== gradertUttaksperiode?.grad ||
        JSON.stringify(localGradertUttak?.uttaksalder) !==
          JSON.stringify(gradertUttaksperiode?.uttaksalder) ||
        parseInt(localGradertUttak?.aarligInntektVsaPensjonBeloep ?? '', 10) !==
          gradertUttaksperiode?.aarligInntektVsaPensjonBeloep ||
        JSON.stringify(localHeltUttak?.uttaksalder) !==
          JSON.stringify(uttaksalder) ||
        parseInt(localHeltUttak?.aarligInntektVsaPensjon?.beloep ?? '', 10) !==
          aarligInntektVsaHelPensjon?.beloep ||
        JSON.stringify(localHeltUttak?.aarligInntektVsaPensjon?.sluttAlder) !==
          JSON.stringify(aarligInntektVsaHelPensjon?.sluttAlder))

    setIsFormUnderUpdate((previous) => {
      return previous !== updatedIsFormUnderUpdate
        ? updatedIsFormUnderUpdate
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
    isFormUnderUpdate,
    localInntektFremTilUttak,
    localHeltUttak,
    localGradertUttak,
    handlers,
  ] as const
}
