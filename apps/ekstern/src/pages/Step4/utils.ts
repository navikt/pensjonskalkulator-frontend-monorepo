import { paths } from '@/router'

export function getNesteSide(
  harSamboer: boolean | null,
  isInntektError?: boolean
): string {
  if (isInntektError || harSamboer === null) {
    return paths.uventetFeil
  }
  return harSamboer ? paths.beregning : paths.sivilstand
}
