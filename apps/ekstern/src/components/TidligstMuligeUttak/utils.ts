export const generateAlderArray = (
  startAlder: number,
  endAlder: number,
  formatertTidligsteMuligeUttaksalder: string
) => {
  const alderArray: string[] = []
  for (let i = startAlder; i <= endAlder; i++) {
    if (i === startAlder) {
      alderArray.push(formatertTidligsteMuligeUttaksalder)
    } else {
      alderArray.push(`${i.toString()} år`)
    }
  }
  return alderArray
}

export const generateXAxis = (startAlder: number, endAlder: number) => {
  const alderArray: number[] = []
  for (let i = startAlder; i <= endAlder; i++) {
    alderArray.push(i)
  }
  return alderArray
}

export const formatTidligsteMuligeUttaksalder = (
  tidligsteMuligeUttaksalder: TidligsteMuligeUttaksalder
): string => {
  return tidligsteMuligeUttaksalder.maaned !== 0
    ? `${tidligsteMuligeUttaksalder.aar} år og ${tidligsteMuligeUttaksalder.maaned} måneder`
    : `${tidligsteMuligeUttaksalder.aar} år`
}
