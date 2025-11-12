import { Page } from '@playwright/test'

declare global {
  interface Window {
    store: { dispatch: (...args: unknown[]) => void }
    router: { navigate: (url: string) => void }
  }
}

export async function fillOutStegvisning(
  page: Page,
  args: Partial<{
    samtykke: boolean
    afp: string
    samtykkeAfpOffentlig: boolean
    sivilstand: string
    epsHarPensjon: boolean | null
    epsHarInntektOver2G: boolean | null
  }>
) {
  const {
    samtykke = false,
    afp = 'vet_ikke',
    samtykkeAfpOffentlig = true,
    sivilstand = 'UGIFT',
    epsHarPensjon = null,
    epsHarInntektOver2G = null,
  } = args

  await page.waitForFunction(
    () => {
      const w = window as unknown as { store?: { dispatch: unknown } }
      return w.store !== undefined && typeof w.store.dispatch === 'function'
    },
    { timeout: 30000 }
  )

  await page.evaluate(
    ({ samtykke: v }) =>
      window.store.dispatch({ type: 'userInputSlice/setSamtykke', payload: v }),
    { samtykke }
  )

  if (afp === 'ja_offentlig') {
    await page.evaluate(
      ({ v }) =>
        window.store.dispatch({
          type: 'userInputSlice/setSamtykkeOffentligAFP',
          payload: v,
        }),
      { v: samtykkeAfpOffentlig }
    )
  }

  await page.evaluate(
    ({ v }) =>
      window.store.dispatch({ type: 'userInputSlice/setAfp', payload: v }),
    { v: afp }
  )

  await page.evaluate(
    ({ sivilstand: s, epsHarPensjon: epp, epsHarInntektOver2G: epi2g }) =>
      window.store.dispatch({
        type: 'userInputSlice/setSivilstand',
        payload: {
          sivilstand: s,
          epsHarPensjon: epp,
          epsHarInntektOver2G: epi2g,
        },
      }),
    { sivilstand, epsHarPensjon, epsHarInntektOver2G }
  )

  await page.evaluate(() => window.router.navigate('/beregning'))
}
