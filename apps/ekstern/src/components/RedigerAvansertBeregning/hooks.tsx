import React from 'react'

import {
  generateTidligstMuligHeltUttakRequestBody,
  generateTidligstMuligGradertUttakRequestBody,
} from '@/state/api/utils'

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

  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState<
    boolean | null
  >(false)

  React.useEffect(() => {
    const updatedHasUnsavedChanges =
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
        (localHeltUttak?.aarligInntektVsaPensjon?.beloep ?? 0) !==
          (aarligInntektVsaHelPensjon?.beloep ?? 0) ||
        JSON.stringify(localHeltUttak?.aarligInntektVsaPensjon?.sluttAlder) !==
          JSON.stringify(aarligInntektVsaHelPensjon?.sluttAlder))

    setHasUnsavedChanges((previous) => {
      return previous !== updatedHasUnsavedChanges
        ? updatedHasUnsavedChanges
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
    hasUnsavedChanges,
    localInntektFremTilUttak,
    localHeltUttak,
    localGradertUttak,
    handlers,
  ] as const
}

export const useTidligstMuligUttakRequestBodyState = (initialValues: {
  afp: AfpRadio | null
  sivilstand: Sivilstand | undefined
  harSamboer: boolean | null
  aarligInntektFoerUttakBeloep: number | null | undefined
  localInntektFremTilUttak: number | null
  localGradertUttak?: Omit<
    RecursivePartial<GradertUttak>,
    'aarligInntektVsaPensjonBeloep'
  > & {
    aarligInntektVsaPensjonBeloep?: string
  }
  localHeltUttak?: RecursivePartial<HeltUttak>
}) => {
  const {
    afp,
    sivilstand,
    harSamboer,
    aarligInntektFoerUttakBeloep,
    localInntektFremTilUttak,
    localGradertUttak,
    localHeltUttak,
  } = initialValues

  const [
    tidligstMuligHeltUttakRequestBody,
    setTidligstMuligHeltUttakRequestBody,
  ] = React.useState<TidligstMuligHeltUttakRequestBody | undefined>(undefined)

  const [
    tidligstMuligGradertUttakRequestBody,
    setTidligstMuligGradertUttakRequestBody,
  ] = React.useState<TidligstMuligGradertUttakRequestBody | undefined>(
    undefined
  )

  React.useEffect(() => {
    const oppdatertHeltUttakRequestBody =
      generateTidligstMuligHeltUttakRequestBody({
        afp,
        sivilstand: sivilstand,
        harSamboer,
        aarligInntektFoerUttakBeloep:
          localInntektFremTilUttak !== null
            ? localInntektFremTilUttak
            : aarligInntektFoerUttakBeloep ?? 0,
      })

    if (oppdatertHeltUttakRequestBody !== undefined) {
      setTidligstMuligHeltUttakRequestBody(oppdatertHeltUttakRequestBody)
    }

    if (localGradertUttak?.grad) {
      setTidligstMuligGradertUttakRequestBody(
        generateTidligstMuligGradertUttakRequestBody({
          afp,
          sivilstand: sivilstand,
          harSamboer,
          aarligInntektFoerUttakBeloep:
            localInntektFremTilUttak !== null
              ? localInntektFremTilUttak
              : aarligInntektFoerUttakBeloep ?? 0,
          heltUttak: {
            uttaksalder:
              localHeltUttak?.uttaksalder?.aar &&
              localHeltUttak?.uttaksalder?.maaneder !== undefined
                ? (localHeltUttak?.uttaksalder as Alder)
                : { aar: 67, maaneder: 0 },
            aarligInntektVsaPensjon:
              localHeltUttak?.aarligInntektVsaPensjon?.beloep &&
              localHeltUttak?.aarligInntektVsaPensjon?.sluttAlder
                ? {
                    beloep: localHeltUttak?.aarligInntektVsaPensjon?.beloep,

                    sluttAlder: {
                      ...(localHeltUttak?.aarligInntektVsaPensjon
                        ?.sluttAlder as Alder),
                    },
                  }
                : undefined,
          },
          gradertUttak: {
            grad: localGradertUttak?.grad,
            aarligInntektVsaPensjonBeloep:
              localGradertUttak.aarligInntektVsaPensjonBeloep
                ? parseInt(
                    localGradertUttak.aarligInntektVsaPensjonBeloep as string,
                    10
                  )
                : undefined,
          },
        })
      )
    }
  }, [
    afp,
    sivilstand,
    aarligInntektFoerUttakBeloep,
    harSamboer,
    localGradertUttak,
    localHeltUttak,
  ])

  const handlers = React.useMemo(
    () => ({
      setTidligstMuligHeltUttakRequestBody:
        setTidligstMuligHeltUttakRequestBody,
      setTidligstMuligGradertUttakRequestBody:
        setTidligstMuligGradertUttakRequestBody,
    }),
    []
  )

  return [
    tidligstMuligHeltUttakRequestBody,
    tidligstMuligGradertUttakRequestBody,
    handlers,
  ] as const
}
