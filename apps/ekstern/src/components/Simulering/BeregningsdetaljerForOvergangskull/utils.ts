import { AfpDetaljerListe } from './hooks'

export interface LoependeLivsvarigAfpOffentlig {
  afpStatus?: boolean
  virkningFom?: string
  maanedligBeloep?: number
  sistBenyttetGrunnbeloep?: number
}

export const hasInvalidMonthlyLivsvarigAfpBeloep = (
  loependeLivsvarigAfpOffentlig: LoependeLivsvarigAfpOffentlig | undefined
) =>
  loependeLivsvarigAfpOffentlig?.afpStatus &&
  (loependeLivsvarigAfpOffentlig?.maanedligBeloep === undefined ||
    loependeLivsvarigAfpOffentlig?.maanedligBeloep === null)

export const shouldHideAfpDetaljer = ({
  afpDetaljerListe,
  loependeLivsvarigAfpOffentlig,
}: {
  afpDetaljerListe: AfpDetaljerListe[]
  loependeLivsvarigAfpOffentlig: LoependeLivsvarigAfpOffentlig | undefined
}) => {
  return Boolean(
    afpDetaljerListe.length === 0 ||
    afpDetaljerListe.every(
      (afpDetaljer) =>
        afpDetaljer.afpPrivat.length === 0 &&
        afpDetaljer.afpOffentlig.length === 0 &&
        afpDetaljer.afpOffentligSpk.length === 0 &&
        afpDetaljer.pre2025OffentligAfp.length === 0
    ) ||
    hasInvalidMonthlyLivsvarigAfpBeloep(loependeLivsvarigAfpOffentlig)
  )
}
