export const onButtonClick = (
  c: number,
  setCount: React.Dispatch<React.SetStateAction<number>>
): void => {
  setCount(c + 1)
}
