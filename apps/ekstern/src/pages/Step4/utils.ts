import { paths } from '@/router/constants'

export function getNesteSide(
  harSamboer: boolean | null,
  isInntektError?: boolean
): string {
  if (isInntektError || harSamboer === null) {
    return paths.uventetFeil
  }
  return harSamboer ? paths.beregningEnkel : paths.sivilstand
}
