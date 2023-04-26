import * as Highcharts from 'highcharts'

export const PENSJONSGIVENDE_DATA = [
  650000, 260000, 60000, 70000, 70000, 70000, 70000, 70000, 70000, 70000, 70000,
  70000, 70000, 70000, 70000, 70000, 70000, 70000,
]

export const AFP_DATA = [
  0, 20000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000,
  80000, 80000, 80000, 80000, 80000, 80000, 80000,
]

export const FOLKETRYGDEN_DATA = [
  0, 35000, 175000, 175000, 175000, 175000, 175000, 175000, 175000, 175000,
  175000, 175000, 175000, 175000, 175000, 175000, 175000, 175000,
]

export const simulateTjenestepensjon = (
  startAge: number,
  endAge: number,
  value = 80_000
) => {
  if (endAge < startAge) {
    throw Error(
      "Can't simulate tjenestepensjon when endAge is larger than startAge"
    )
  }

  return new Array(endAge + 2 - startAge)
    .fill(startAge - 1)
    .map((age, i, array) =>
      age + i < 67 ? 0 : i === array.length - 1 ? 0 : value
    )
}

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

export const onVisFlereAarClick = () => {
  const el = document.querySelector('.highcharts-scrolling')
  if (el) {
    ;(el as HTMLElement).scrollLeft += 50
  }
}

export const generateXAxis = (startAlder: number, endAlder: number) => {
  const alderArray: string[] = []
  for (let i = startAlder; i <= endAlder; i++) {
    if (i === startAlder) {
      alderArray.push((i - 1).toString())
    }

    if (i === endAlder) {
      alderArray.push(`${i - 1}+`.toString())
    } else {
      alderArray.push(i.toString())
    }
  }
  return alderArray
}
