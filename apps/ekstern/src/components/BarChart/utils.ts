import { ChartData } from './BarChart'

export const getBarChartHeight = (
  value: number,
  maxValue: number,
  maxHeight: number = 128
) => {
  if (value === 0) {
    return 0
  }
  return (value / maxValue) * maxHeight
}

export const findMaxValue = (data: ChartData[]): number => {
  return data.reduce((max, { value }) => (max > value ? max : value), 0)
}
