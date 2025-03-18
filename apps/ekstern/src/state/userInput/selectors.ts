import { createSelector } from '@reduxjs/toolkit'

import { apiSlice } from '@/state/api/apiSlice'
import { RootState } from '@/state/store'
import { Simulation } from '@/state/userInput/userInputSlice'
import { formatInntekt } from '@/utils/inntekt'
import { isLoependeVedtakEndring } from '@/utils/loependeVedtak'

export const selectHarUtenlandsopphold = (state: RootState): boolean | null =>
  state.userInput.harUtenlandsopphold

export const selectUtenlandsperioder = (state: RootState) =>
  state.userInput.utenlandsperioder

export const selectSamtykke = (state: RootState): boolean | null =>
  state.userInput.samtykke

export const selectSamtykkeOffentligAFP = (state: RootState): boolean | null =>
  state.userInput.samtykkeOffentligAFP

export const selectVeilederBorgerFnr = (state: RootState) =>
  state.userInput.veilederBorgerFnr

export const selectVeilederBorgerEncryptedFnr = (state: RootState) =>
  state.userInput.veilederBorgerEncryptedFnr

export const selectIsVeileder = (state: RootState) =>
  !!state.userInput.veilederBorgerFnr ||
  !!state.userInput.veilederBorgerEncryptedFnr

export const selectAfp = (state: RootState): AfpRadio | null =>
  state.userInput.afp

export const selectSkalBeregneAfp = (state: RootState): boolean | null =>
  state.userInput.skalBeregneAfp
const selectPersonResponse = apiSlice.endpoints.getPerson.select()
const selectInntektResponse = apiSlice.endpoints.getInntekt.select()
const selectLoependeVedtakResponse =
  apiSlice.endpoints.getLoependeVedtak.select()

export const selectFoedselsdato = createSelector(
  selectPersonResponse,
  (personResponse) => personResponse.data?.foedselsdato
)

export const selectNedreAldersgrense = createSelector(
  selectPersonResponse,
  (personResponse) =>
    personResponse.data?.pensjoneringAldre.nedreAldersgrense as Alder
)

export const selectNormertPensjonsalder = createSelector(
  selectPersonResponse,
  (personResponse) =>
    personResponse.data?.pensjoneringAldre.normertPensjoneringsalder as Alder
)

export const selectSivilstand = (state: RootState) => {
  if (state.userInput.sivilstand) {
    return state.userInput.sivilstand
  }

  // Henter sivilstand fra vedtak hvis det er en endringssøknad, hvis ikke hentes sivilstand fra personopplysninger
  return selectIsEndring(state)
    ? selectLoependeVedtakResponse(state).data?.alderspensjon?.sivilstand
    : selectPersonResponse(state).data?.sivilstand
}

export const selectEpsHarInntektOver2G = (state: RootState): boolean | null =>
  state.userInput.epsHarInntektOver2G

export const selectEpsHarPensjon = (state: RootState): boolean | null =>
  state.userInput.epsHarPensjon

export const selectAarligInntektFoerUttakBeloepFraBrukerInput = (
  state: RootState
): string | null =>
  state.userInput.currentSimulation.aarligInntektFoerUttakBeloep

export const selectAarligInntektFoerUttakBeloepFraSkatt = createSelector(
  selectInntektResponse,
  (inntektResponse) => {
    const aarligInntektFraSkatt = inntektResponse.data
    return aarligInntektFraSkatt
      ? {
          ...aarligInntektFraSkatt,
          beloep: formatInntekt(aarligInntektFraSkatt?.beloep),
        }
      : undefined
  }
)

export const selectAarligInntektFoerUttakBeloep = (
  state: RootState
): string | null | undefined => {
  const aarligInntektFoerUttakBeloepFraBrukerInput =
    selectAarligInntektFoerUttakBeloepFraBrukerInput(state)

  if (aarligInntektFoerUttakBeloepFraBrukerInput === null) {
    return formatInntekt(
      selectAarligInntektFoerUttakBeloepFraSkatt(state)?.beloep
    )
  }
  return aarligInntektFoerUttakBeloepFraBrukerInput
}

export const selectFormatertUttaksalderReadOnly = (
  state: RootState
): string | null =>
  state.userInput.currentSimulation.formatertUttaksalderReadOnly

export const selectCurrentSimulation = (state: RootState): Simulation =>
  state.userInput.currentSimulation

export const selectLoependeVedtak = createSelector(
  selectLoependeVedtakResponse,
  (loependeVedtakResponse) => loependeVedtakResponse.data as LoependeVedtak
)

export const selectUfoeregrad = createSelector(
  selectLoependeVedtakResponse,
  (loependeVedtakResponse) =>
    loependeVedtakResponse?.data?.ufoeretrygd
      .grad as LoependeVedtak['ufoeretrygd']['grad']
)

export const selectIsEndring = createSelector(
  selectLoependeVedtakResponse,
  (loependeVedtakResponse) => {
    if (!loependeVedtakResponse.data) {
      return false
    }
    return isLoependeVedtakEndring(loependeVedtakResponse.data)
  }
)
