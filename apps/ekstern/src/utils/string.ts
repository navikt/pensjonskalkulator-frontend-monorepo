export const capitalize = (value: string): string => {
  if (value.length < 2) {
    return value.toUpperCase()
  }

  return value[0].toUpperCase() + value.slice(1)
}
