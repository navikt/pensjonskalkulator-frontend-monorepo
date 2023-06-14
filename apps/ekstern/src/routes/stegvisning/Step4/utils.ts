export function checkHarSamboer(sivilstand: Sivilstand): boolean {
  return ['GIFT', 'REGISTRERT_PARTNER'].includes(sivilstand)
}

export function getNesteSide(harSamboer: boolean | null): string {
  return harSamboer ? '/beregning' : '/sivilstand'
}
