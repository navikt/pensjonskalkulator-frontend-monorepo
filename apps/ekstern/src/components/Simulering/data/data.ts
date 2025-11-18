import type { SeriesOptionsType } from 'highcharts'

type Alder = {
  aar: number
  maaneder: number
}

export type AarligUtbetalingStartSlutt = {
  startAlder: Alder
  sluttAlder?: Alder
  aarligUtbetaling: number
}

export type AarligUtbetaling = {
  alder: number
  beloep: number
}

export const parseStartSluttUtbetaling = (
  data: AarligUtbetalingStartSlutt,
  maxAlder?: number
): AarligUtbetaling[] => {
  const erLivsvarig = !data.sluttAlder

  const { startAlder, sluttAlder, aarligUtbetaling } = data

  // Måndeder starter på 0 (januar) og slutter på 11 (desember)
  const MAANEDER_I_AARET = 12
  const MAANEDER_MED_FORSTE_YTELSE = MAANEDER_I_AARET - startAlder.maaneder

  // Andel av sum første år
  const forsteAarAndel = MAANEDER_MED_FORSTE_YTELSE / MAANEDER_I_AARET

  // Siste andel år er bare dersom det ikke er livsvarig
  const MAANEDER_MED_SISTE_YTELSE = (sluttAlder?.maaneder ?? 11) + 1
  const sisteAarAndel = MAANEDER_MED_SISTE_YTELSE / MAANEDER_I_AARET

  const forsteUtbetaling: AarligUtbetaling = {
    alder: startAlder.aar,
    beloep: aarligUtbetaling * forsteAarAndel,
  }

  // For livsvarig utbetaling, extend to maxAlder or use a default high value
  const effectiveSluttAar = erLivsvarig
    ? (maxAlder ?? 100)
    : (sluttAlder?.aar ?? 0)

  const sisteUtbetaling: AarligUtbetaling = {
    alder: effectiveSluttAar,
    beloep: erLivsvarig
      ? aarligUtbetaling
      : Math.round(aarligUtbetaling * sisteAarAndel),
  }

  const years = Array.from(
    { length: effectiveSluttAar - startAlder.aar + 1 },
    (_, i) => startAlder.aar + i
  )

  const utbetalinger: AarligUtbetaling[] = years.map((year) => {
    if (year === forsteUtbetaling.alder) {
      return forsteUtbetaling
    } else if (year === sisteUtbetaling.alder && !erLivsvarig) {
      return sisteUtbetaling
    } else {
      return {
        alder: year,
        beloep: aarligUtbetaling,
      }
    }
  })

  return utbetalinger
}

export const mergeAarligUtbetalinger = (
  utbetalinger: AarligUtbetaling[][]
): AarligUtbetaling[] => {
  if (utbetalinger.length === 0) {
    return []
  }

  const allUtbetalinger = utbetalinger.flat()

  // Get all unique years
  const years = [...new Set(allUtbetalinger.map((u) => u.alder))].sort(
    (a, b) => a - b
  )

  // Group by year and sum up the amounts
  return years.map((year) => {
    const beloep = allUtbetalinger
      .filter((u) => u.alder === year)
      .reduce((sum, curr) => sum + curr.beloep, 0)

    return { alder: year, beloep }
  })
}

type XAxis = Record<number, number>
export const generateXAxis = (utbetalinger: AarligUtbetaling[][]) => {
  const { min, max } = utbetalinger.reduce(
    (acc, curr) => {
      if (curr.length === 0) return acc

      // Filter out Infinity to find real min/max ages
      const finiteAges = curr
        .map((it) => it.alder)
        .filter((alder) => alder !== Infinity)

      if (finiteAges.length === 0) {
        // Only Infinity values in this series
        return acc
      }

      const utebetalingMin = Math.min(...finiteAges)
      const utebetalingMax = Math.max(...finiteAges)

      return {
        min: Math.min(acc.min, utebetalingMin),
        max: Math.max(acc.max, utebetalingMax),
      }
    },
    { min: Infinity, max: -Infinity }
  )

  // No valid min/max found (e.g., empty arrays)
  if (min === Infinity || max === -Infinity) {
    return {}
  }

  return Array.from({ length: max - min + 1 }, (_, i) => min + i).reduce(
    (acc, alder) => {
      acc[alder] = 0
      return acc
    },
    {} as XAxis
  )
}

export const fillYAxis = (
  xAxis: XAxis,
  utbetalinger: AarligUtbetaling[]
): number[] => {
  const result: number[] = []
  const xAxisKeys = Object.keys(xAxis)

  for (let i = 0; i < xAxisKeys.length; i++) {
    const alder = xAxisKeys[i]
    const alderNum = Number(alder)

    // Find exact match
    const exactUtbetaling = utbetalinger.find((u) => u.alder === alderNum)

    if (exactUtbetaling) {
      result.push(exactUtbetaling.beloep)
    } else {
      result.push(0)
    }
  }

  return result
}

export interface SeriesConfig {
  data: AarligUtbetaling[]
  type: string
  name: string
  color: string
  pointWidth?: number
}

interface SeriesReturn {
  xAxis: string[]
  series: SeriesOptionsType[]
}

export const generateSeries = (seriesConfig: SeriesConfig[]): SeriesReturn => {
  const xAxisSkeleton = generateXAxis(seriesConfig.map((it) => it.data))

  const series: SeriesOptionsType[] = seriesConfig
    .filter((it) => it.data.length > 0)
    .map((it) => ({
      type: it.type as 'column',
      name: it.name,
      color: it.color,
      pointWidth: it.pointWidth ?? 25,
      stacking: 'normal',
      data: fillYAxis(xAxisSkeleton, it.data),
    }))

  const xAxis = Object.keys(xAxisSkeleton)

  // Always add "age+" label for the last age to indicate continuation
  if (xAxis.length > 0) {
    const lastAge = xAxis[xAxis.length - 1]
    xAxis.push(`${lastAge}+`)

    // Add one more data point to each series for the "age+" position
    series.forEach((serie) => {
      // Use the last value for the "age+" position
      const columnSerie = serie as { data: number[] }
      const lastValue = columnSerie.data[columnSerie.data.length - 1]
      columnSerie.data.push(lastValue)
    })
  }

  return {
    xAxis,
    series,
  }
}
