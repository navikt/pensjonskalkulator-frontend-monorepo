export const isUttaksalderOver62 = (tidligstMuligUttak: Uttaksalder) => {
  if (tidligstMuligUttak.aar > 62) {
    return true
  } else if (tidligstMuligUttak.aar === 62 && tidligstMuligUttak.maaneder > 0) {
    return true
  } else {
    return false
  }
}
