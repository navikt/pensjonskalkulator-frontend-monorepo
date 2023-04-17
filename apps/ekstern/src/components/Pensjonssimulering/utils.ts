export const generateAlderArray = (startAlder: number, endAlder: number) => {
  const alderArray: string[] = []
  for (let i = startAlder; i <= endAlder; i++) {
    alderArray.push(i.toString())
  }
  return alderArray
}
