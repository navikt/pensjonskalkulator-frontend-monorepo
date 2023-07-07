export function checkHarSamboer(sivilstand: Sivilstand): boolean {
  return ['GIFT', 'REGISTRERT_PARTNER'].includes(sivilstand)
}

export function getNesteSide(harSamboer: boolean | null): string {
  if (harSamboer === null) {
    return '/sivilstand-feil'
  }
  return harSamboer ? '/beregning' : '/sivilstand'
}
