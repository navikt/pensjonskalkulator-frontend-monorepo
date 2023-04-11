export const generateAlderArray = (startAlder: number, endAlder: number) => {
  const alderArray = []
  for (let i = startAlder; i <= endAlder; i++) {
    alderArray.push(i)
  }
  return alderArray
}
