import { type RouteDefinition } from '../../base'

type AfpOffentligLivsvarigMockOptions = {
  afpStatus?: boolean
  maanedligBeloep?: number | null
  virkningFom?: string
  sistBenyttetGrunnbeloep?: number
}

export const afpOffentligLivsvarig = (
  options: AfpOffentligLivsvarigMockOptions = {}
): RouteDefinition => {
  const defaultResponse = {
    afpStatus: true,
    maanedligBeloep: 25000,
    virkningFom: '2023-01-01',
    sistBenyttetGrunnbeloep: 118620,
  }

  return {
    url: /\/pensjon\/kalkulator\/api\/v2\/tpo-livsvarig-offentlig-afp/,
    overrideJsonResponse: {
      ...defaultResponse,
      ...options,
    },
  }
}

const createAfpOffentligLivsvarigErrorResponse = (): RouteDefinition => ({
  url: /\/pensjon\/kalkulator\/api\/v2\/tpo-livsvarig-offentlig-afp/,
  status: 500,
})

export const afpOffentligLivsvarigError = (): RouteDefinition =>
  createAfpOffentligLivsvarigErrorResponse()

export const afpOffentligLivsvarigFlereTpOrdninger = (): RouteDefinition =>
  createAfpOffentligLivsvarigErrorResponse()
