import { paths } from '@/routes'

export function getNesteSide(harSamboer: boolean | null): string {
  if (harSamboer === null) {
    return paths.sivilstandFeil
  }
  return harSamboer ? paths.beregning : paths.sivilstand
}
