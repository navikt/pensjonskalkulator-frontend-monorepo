export const convertBooleanToBooleanRadio = (
  input: boolean | null
): BooleanRadio | null => (input !== null ? (input ? 'ja' : 'nei') : null)

export const convertBooleanRadioToBoolean = (
  input: BooleanRadio | null
): boolean | null => {
  if (input === null) {
    return null
  }
  return input === 'ja' ? true : false
}
