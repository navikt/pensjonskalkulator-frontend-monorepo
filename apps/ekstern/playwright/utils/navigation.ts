import { Page } from '@playwright/test'

import '@/types/types.d.ts'

declare global {
  interface Window {
    store: { dispatch: (...args: unknown[]) => void }
    router: { navigate: (url: string) => void }
  }
}

type NavigationStep =
  | 'sivilstand'
  | 'utenlandsopphold'
  | 'afp'
  | 'ufoeretrygd-afp'
  | 'samtykke-offentlig-afp'
  | 'samtykke'
  | 'beregning'
  | 'beregning-detaljert'

export async function fillOutStegvisning(
  page: Page,
  args: {
    afp?: AfpRadio
    samtykke?: boolean
    samtykkeAfpOffentlig?: boolean
    sivilstand?: Sivilstand
    epsHarPensjon?: boolean | null
    epsHarInntektOver2G?: boolean | null
    navigateTo: NavigationStep
  }
) {
  const {
    afp,
    samtykke,
    samtykkeAfpOffentlig,
    sivilstand,
    epsHarPensjon,
    epsHarInntektOver2G,
    navigateTo,
  } = args

  await waitForStoreDispatch(page)

  if (sivilstand !== undefined) {
    await page.evaluate(
      ({ sivilstand: s, epsHarPensjon: epp, epsHarInntektOver2G: epi2g }) =>
        window.store.dispatch({
          type: 'userInputSlice/setSivilstand',
          payload: {
            sivilstand: s,
            epsHarPensjon: epp ?? null,
            epsHarInntektOver2G: epi2g ?? null,
          },
        }),
      { sivilstand, epsHarPensjon, epsHarInntektOver2G }
    )
  }

  if (afp !== undefined) {
    await page.evaluate(
      ({ v }) =>
        window.store.dispatch({ type: 'userInputSlice/setAfp', payload: v }),
      { v: afp }
    )
  }

  if (afp === 'ja_offentlig' && samtykkeAfpOffentlig !== undefined) {
    await page.evaluate(
      ({ v }) =>
        window.store.dispatch({
          type: 'userInputSlice/setSamtykkeOffentligAFP',
          payload: v,
        }),
      { v: samtykkeAfpOffentlig }
    )
  }

  if (samtykke !== undefined) {
    await page.evaluate(
      ({ v }) =>
        window.store.dispatch({
          type: 'userInputSlice/setSamtykke',
          payload: v,
        }),
      { v: samtykke }
    )
  }

  await page.evaluate(({ path }) => window.router.navigate(path), {
    path: `/${navigateTo}`,
  })

  await page.waitForURL(`**/pensjon/kalkulator/${navigateTo}*`, {
    waitUntil: 'domcontentloaded',
  })
}

export async function waitForStoreDispatch(page: Page) {
  return await page.waitForFunction(
    () => {
      const w = window as unknown as { store?: { dispatch: unknown } }
      return w.store !== undefined && typeof w.store.dispatch === 'function'
    },
    { timeout: 30000 }
  )
}
