import * as Highcharts from 'highcharts'

export const PENSJONSGIVENDE_DATA = [
  650000, 550000, 60000, 70000, 70000, 70000, 70000, 70000, 70000, 70000, 70000,
  70000, 70000, 70000, 70000, 70000, 70000,
]

export const AFP_DATA = [
  0, 20000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000,
  80000, 80000, 80000, 80000, 80000, 80000,
]

export const TJENESTEPENSJON_DATA = [
  0, 0, 0, 0, 0, 0, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000,
  80000, 80000, 80000,
]

export const FOLKETRYGDEN_DATA = [
  0, 35000, 175000, 175000, 175000, 175000, 175000, 175000, 175000, 175000,
  175000, 175000, 175000, 175000, 175000, 175000, 175000,
]

export const simulateDataArray = (array: number[], length: number) => {
  return [...array].splice(0, length)
}

export function labelFormatter(
  this: Highcharts.AxisLabelsFormatterContextObject
) {
  return this.value > 1000
    ? ((this.value as number) / 1000).toString()
    : this.value.toString()
}

export function tooltipFormatter(
  this: Highcharts.TooltipFormatterContextObject
) {
  return `<b>${this.x}</b><br/>${this.series.name}: ${this.y}<br/>Total: x`
}
