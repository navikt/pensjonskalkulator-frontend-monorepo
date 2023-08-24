import { paths } from '@/routes'

export function checkHarSamboer(sivilstand: Sivilstand): boolean {
  return ['GIFT', 'REGISTRERT_PARTNER'].includes(sivilstand)
}

export function getNesteSide(harSamboer: boolean | null): string {
  if (harSamboer === null) {
    return paths.sivilstandFeil
  }
  return harSamboer ? paths.beregning : paths.sivilstand
}
