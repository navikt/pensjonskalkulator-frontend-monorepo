export const isUttaksalderOver62 = (tidligstMuligUttak: Uttaksalder) => {
  if (tidligstMuligUttak.aar > 62) {
    return true
  } else if (tidligstMuligUttak.maaned > 1) {
    return true
  } else {
    return false
  }
}
