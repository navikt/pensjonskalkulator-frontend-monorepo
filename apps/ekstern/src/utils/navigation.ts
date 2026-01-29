import { redirect } from 'react-router'

/**
 * Skip funksjon for access guards
 *
 * Denne funksjonen bestemmer om det skal hoppes til neste eller forrige steg basert på query parameter 'back'
 *
 * @param stepArrays - Array med stier i stegsekvensen
 * @param currentPath - Gjeldende sti som skal hoppes over
 * @returns En redirect respons til passende neste/forrige steg
 */
export const skip = (
  stepArrays: readonly string[],
  currentPath: string,
  request: Request
) => {
  const currentIndex = stepArrays.indexOf(currentPath)
  if (currentIndex === -1) {
    // Sti ikke funnet i stegene
    return redirect(stepArrays[0])
  }

  const isBackwardNavigation =
    new URL(request.url).searchParams.get('back') === 'true'

  const redirectIndex = isBackwardNavigation
    ? currentIndex - 1
    : currentIndex + 1

  // Sjekk at redirect-indeksen er innenfor grensene
  if (redirectIndex < 0 || redirectIndex >= stepArrays.length) {
    return redirect(stepArrays[0])
  }

  // Opprett redirect URL
  const redirectPath = stepArrays[redirectIndex]

  // Returner redirect og behold navigasjonsretningen
  // ved å inkludere 'back' query parameter ved bakovernavigasjon
  return redirect(
    isBackwardNavigation ? `${redirectPath}?back=true` : redirectPath
  )
}
