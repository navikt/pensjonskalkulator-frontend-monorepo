export function checkHarSamboer(sivilstand: Sivilstand): boolean {
  return ['GIFT', 'REGISTRERT_PARTNER'].includes(sivilstand)
}
