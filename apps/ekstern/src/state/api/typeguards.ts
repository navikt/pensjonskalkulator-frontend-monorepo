/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { pensjonsavtalerKategoriMapObj } from '@/utils/pensjonsavtaler'

export const isInntekt = (data?: any): data is Inntekt => {
  if (
    data === null ||
    data === undefined ||
    data.beloep === undefined ||
    data.aar === undefined
  ) {
    return false
  }
  return !!(
    data.beloep >= 0 &&
    typeof data.beloep === 'number' &&
    data.aar >= 0 &&
    typeof data.aar === 'number'
  )
}

export const isPensjonsberegningArray = (
  data?: any
): data is AfpPensjonsberegning[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (beregning) =>
        typeof beregning.alder === 'number' &&
        typeof beregning.beloep === 'number'
    )
  )
}

export const isVilkaarsproeving = (data?: any): data is Vilkaarsproeving => {
  if (data === null || data === undefined) {
    return false
  }
  if (
    data.vilkaarErOppfylt === null ||
    data.vilkaarErOppfylt === undefined ||
    typeof data.vilkaarErOppfylt !== 'boolean'
  ) {
    return false
  }

  if (data.alternativ === undefined) {
    return true
  } else {
    return (
      typeof data.alternativ === 'object' &&
      (data.alternativ.gradertUttaksalder === undefined ||
        isAlder(data.alternativ.gradertUttaksalder)) &&
      (data.alternativ.uttaksgrad === undefined ||
        typeof data.alternativ.uttaksgrad === 'number') &&
      (data.alternativ.heltUttaksalder === undefined ||
        isAlder(data.alternativ.heltUttaksalder))
    )
  }
}

export const isAlderspensjonMaanedligVedEndring = (data?: any) => {
  if (data === null) {
    return false
  }
  return (
    typeof data.heltUttakMaanedligBeloep === 'number' &&
    (data.gradertUttakMaanedligBeloep === undefined ||
      typeof data.gradertUttakMaanedligBeloep === 'number')
  )
}

export const isAlderspensjonSimulering = (
  data?: any
): data is AlderspensjonResponseBody => {
  if (data === undefined || data === null) {
    return false
  }
  if (
    !isPensjonsberegningArray(data.alderspensjon) ||
    (data.afpPrivat && !isPensjonsberegningArray(data?.afpPrivat)) ||
    (data.afpOffentlig && !isPensjonsberegningArray(data?.afpOffentlig))
  ) {
    return false
  }

  return (
    isVilkaarsproeving(data.vilkaarsproeving) &&
    (data?.alderspensjonMaanedligVedEndring === undefined ||
      isAlderspensjonMaanedligVedEndring(
        data?.alderspensjonMaanedligVedEndring
      )) &&
    (data.harForLiteTrygdetid === undefined ||
      typeof data.harForLiteTrygdetid === 'boolean')
  )
}

export const isUtbetalingsperiode = <T extends boolean>(
  checkGrad: T,
  data?: any
): data is T extends true
  ? Utbetalingsperiode
  : UtbetalingsperiodeOffentligTP => {
  if (data === null || data === undefined) {
    return false
  }

  const hasCorrectSluttAlder =
    data.sluttAlder === undefined ||
    (data.sluttAlder !== undefined && isAlder(data.sluttAlder))

  const hasCorrectGrad = checkGrad ? typeof data.grad === 'number' : true

  return (
    data.startAlder !== undefined &&
    isAlder(data.startAlder) &&
    hasCorrectGrad &&
    data.aarligUtbetaling !== undefined &&
    typeof data.aarligUtbetaling === 'number' &&
    hasCorrectSluttAlder
  )
}

export const isPensjonsavtale = (data?: any): data is Pensjonsavtale => {
  if (data === null || data === undefined) {
    return false
  }

  const hasCorrectUtbetalingsperiode: boolean =
    data.utbetalingsperioder !== undefined &&
    Array.isArray(data.utbetalingsperioder) &&
    data.utbetalingsperioder.every((utbetalingsperiode: any) =>
      isUtbetalingsperiode(true, utbetalingsperiode)
    )

  const harFeilStartAar =
    data.startAar === undefined ||
    !data.startAar ||
    typeof data.startAar !== 'number'
  const harFeilSluttAar =
    data.sluttAar !== undefined && typeof data.sluttAar !== 'number'
  return (
    !Array.isArray(data) &&
    data.produktbetegnelse &&
    typeof data.produktbetegnelse === 'string' &&
    data.kategori &&
    isSomeEnumKey(pensjonsavtalerKategoriMapObj)(data.kategori) &&
    Array.isArray(data.utbetalingsperioder) &&
    hasCorrectUtbetalingsperiode &&
    !harFeilStartAar &&
    !harFeilSluttAar
  )
}

export const isPerson = (data?: any): data is Person => {
  return !!(
    [
      null,
      'UNKNOWN',
      'UOPPGITT',
      'UGIFT',
      'GIFT',
      'ENKE_ELLER_ENKEMANN',
      'SKILT',
      'SEPARERT',
      'REGISTRERT_PARTNER',
      'SEPARERT_PARTNER',
      'SKILT_PARTNER',
      'GJENLEVENDE_PARTNER',
    ].includes(data?.sivilstand) &&
    data.navn &&
    typeof data.navn === 'string' &&
    data.fornavn &&
    typeof data.fornavn === 'string' &&
    data.foedselsdato &&
    data.foedselsdato !== undefined &&
    new Date(data.foedselsdato).toString() !== 'Invalid Date' &&
    data.pensjoneringAldre &&
    typeof data.pensjoneringAldre === 'object' &&
    data.pensjoneringAldre.normertPensjoneringsalder &&
    typeof data.pensjoneringAldre.normertPensjoneringsalder === 'object' &&
    data.pensjoneringAldre.nedreAldersgrense &&
    typeof data.pensjoneringAldre.nedreAldersgrense === 'object' &&
    isAlder(data.pensjoneringAldre.normertPensjoneringsalder) &&
    isAlder(data.pensjoneringAldre.nedreAldersgrense)
  )
}

export const isSimulertOffentligTp = (data?: any) => {
  if (data === null || typeof data !== 'object') {
    return false
  }

  const hasCorrectUtbetalingsperiode: boolean =
    data.simuleringsresultat.utbetalingsperioder !== undefined &&
    Array.isArray(data.simuleringsresultat.utbetalingsperioder) &&
    data.simuleringsresultat.utbetalingsperioder.every(
      (utbetalingsperiode: any) =>
        isUtbetalingsperiode(false, utbetalingsperiode)
    )

  return (
    typeof data.tpLeverandoer === 'string' &&
    typeof data.tpNummer === 'string' &&
    data.simuleringsresultat.betingetTjenestepensjonErInkludert !== undefined &&
    typeof data.simuleringsresultat.betingetTjenestepensjonErInkludert ===
      'boolean' &&
    hasCorrectUtbetalingsperiode
  )
}

export const isOffentligTp = (data?: any): data is OffentligTp => {
  if (
    !data ||
    !data.simuleringsresultatStatus ||
    ![
      'OK',
      'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
      'TP_ORDNING_STOETTES_IKKE',
      'TOM_SIMULERING_FRA_TP_ORDNING',
      'TEKNISK_FEIL',
    ].includes(data.simuleringsresultatStatus)
  ) {
    return false
  }

  const simulertTjenestepensjonValid =
    data.simulertTjenestepensjon !== undefined
      ? isSimulertOffentligTp(data.simulertTjenestepensjon)
      : true

  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    Array.isArray(data.muligeTpLeverandoerListe) &&
    data.muligeTpLeverandoerListe.every(
      (tpLeverandoer: string) => typeof tpLeverandoer === 'string'
    ) &&
    simulertTjenestepensjonValid
  )
}

export const isUnleashToggle = (data?: any): data is UnleashToggle => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    typeof data.enabled === 'boolean'
  )
}

export const isEkskludertStatus = (data?: any): data is EkskludertStatus => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    typeof data.ekskludert === 'boolean' &&
    ['NONE', 'ER_APOTEKER'].includes(data?.aarsak)
  )
}

export const isApotekerStatus = (data?: any): data is ApotekerStatusV1 => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    typeof data.apoteker === 'boolean' &&
    ['NONE', 'ER_APOTEKER'].includes(data?.aarsak)
  )
}

export const isOmstillingsstoenadOgGjenlevende = (
  data?: any
): data is OmstillingsstoenadOgGjenlevende => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    typeof data.harLoependeSak === 'boolean'
  )
}
export const isLoependeVedtak = (data?: any): data is LoependeVedtak => {
  if (data === null || data === undefined || data.ufoeretrygd === null) {
    return false
  }

  return (
    typeof data === 'object' &&
    !Array.isArray(data) &&
    typeof data.ufoeretrygd === 'object' &&
    typeof data.ufoeretrygd.grad === 'number' &&
    (!data.alderspensjon ||
      (data.alderspensjon &&
        typeof data.alderspensjon === 'object' &&
        data.alderspensjon.grad !== undefined &&
        typeof data.alderspensjon.grad === 'number' &&
        [
          'UNKNOWN',
          'UOPPGITT',
          'UGIFT',
          'GIFT',
          'ENKE_ELLER_ENKEMANN',
          'SKILT',
          'SEPARERT',
          'REGISTRERT_PARTNER',
          'SEPARERT_PARTNER',
          'SKILT_PARTNER',
          'GJENLEVENDE_PARTNER',
          'SAMBOER',
        ].includes(data.alderspensjon.sivilstand))) &&
    (!data.alderspensjon ||
      (data.alderspensjon &&
        data.alderspensjon.fom &&
        typeof data.alderspensjon.fom === 'string')) &&
    (!data.afpPrivat ||
      (data.afpPrivat &&
        typeof data.afpPrivat === 'object' &&
        typeof data.afpPrivat.fom === 'string')) &&
    (!data.afpOffentlig ||
      (data.afpOffentlig &&
        typeof data.afpOffentlig === 'object' &&
        typeof data.afpOffentlig.fom === 'string')) &&
    (!data.fremtidigAlderspensjon ||
      (data.fremtidigAlderspensjon &&
        typeof data.fremtidigAlderspensjon === 'object' &&
        typeof data.fremtidigAlderspensjon.grad === 'number' &&
        typeof data.fremtidigAlderspensjon.fom === 'string'))
  )
}

export const isAlder = (data?: any): data is Alder => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    typeof data.aar === 'number' &&
    typeof data.maaneder === 'number'
  )
}

export const isSomeEnumKey =
  <T extends { [s: string]: unknown }>(e: T) =>
  (token: unknown): token is T[keyof T] => {
    return Object.keys(e).includes(token as string)
  }

export const isAnchorTag = (target?: any): target is HTMLAnchorElement => {
  return target && target?.tagName === 'A' && target?.href
}

export const isOffentligTpFoer1963 = (
  offentligTp?: OffentligTp | OffentligTpFoer1963
): offentligTp is OffentligTpFoer1963 => {
  if (!offentligTp || typeof offentligTp !== 'object') {
    return false
  }

  // OffentligTpFoer1963 har et 'feilkode' felt på rot-nivå
  if ('feilkode' in offentligTp) {
    return true
  }

  // UtbetalingsperiodeFoer1963V2 har feltet 'ytelsekode'

  if (
    offentligTp.simulertTjenestepensjon?.simuleringsresultat
      ?.utbetalingsperioder &&
    Array.isArray(
      offentligTp.simulertTjenestepensjon.simuleringsresultat
        .utbetalingsperioder
    ) &&
    offentligTp.simulertTjenestepensjon.simuleringsresultat.utbetalingsperioder
      .length > 0
  ) {
    return (
      'ytelsekode' in
      offentligTp.simulertTjenestepensjon.simuleringsresultat
        .utbetalingsperioder[0]
    )
  }

  return false
}
