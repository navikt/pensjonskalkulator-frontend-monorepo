import { SeriesOptionsType } from 'highcharts'

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
  data: AarligUtbetalingStartSlutt
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
  const sisteUtbetaling: AarligUtbetaling = {
    alder: sluttAlder?.aar ?? 100,
    beloep: Math.round(aarligUtbetaling * sisteAarAndel),
  }
  const sisteAar = sluttAlder?.aar ?? Infinity

  // Hvis den er livsvarig må vi sjekke om forsteAarAndel er < 1, om det er dette må man returnere 2 elementer,
  // hvis ikke 1, me

  const years = erLivsvarig
    ? [startAlder.aar, startAlder.aar + 1, Infinity]
    : Array.from(
        { length: sisteAar - startAlder.aar + 1 },
        (_, i) => startAlder.aar + i
      )
  const utbetalinger: AarligUtbetaling[] = years.map((year) => {
    if (year === forsteUtbetaling.alder) {
      return forsteUtbetaling
    } else if (year === sisteUtbetaling.alder) {
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
  const { min, max, hasInfinite } = utbetalinger.reduce(
    (acc, curr) => {
      if (curr.length === 0) return acc

      const utebetalingMin = curr
        .map((it) => it.alder)
        .reduce((a, b) => Math.min(a, b), Infinity)

      const utebetalingMax = curr
        .map((it) => it.alder)
        .reduce((a, b) => Math.max(a, b), -Infinity)

      return {
        min: Math.min(acc.min, utebetalingMin),
        max:
          utebetalingMax === Infinity
            ? acc.max
            : Math.max(acc.max, utebetalingMax),
        hasInfinite: acc.hasInfinite || utebetalingMax === Infinity,
      }
    },
    { min: Infinity, max: -Infinity, hasInfinite: false }
  )

  // No valid min/max found (e.g., empty arrays)
  if (min === Infinity || max === -Infinity) {
    return {}
  }

  const xAxis = Array.from({ length: max - min + 1 }, (_, i) => min + i).reduce(
    (acc, alder) => {
      acc[alder] = 0
      return acc
    },
    {} as XAxis
  )

  return hasInfinite ? { ...xAxis, ...{ Infinity: 0 } } : xAxis
}

export const fillYAxis = (
  xAxis: XAxis,
  utbetalinger: AarligUtbetaling[]
): number[] => {
  const result: number[] = []
  // Find infinite payment if exists
  const infinitePayment =
    utbetalinger.find((u) => u.alder === Infinity)?.beloep || 0

  for (const alder in xAxis) {
    const alderNum = Number(alder)
    // First check for exact match
    const exactUtbetaling = utbetalinger.find((u) => u.alder === alderNum)

    if (exactUtbetaling) {
      result.push(exactUtbetaling.beloep)
    } else if (infinitePayment > 0) {
      // If there's an infinite payment and we're past all defined ages, add it
      const maxDefinedAge = utbetalinger
        .filter((u) => u.alder !== Infinity)
        .reduce((max, u) => Math.max(max, u.alder), -Infinity)

      result.push(alderNum > maxDefinedAge ? infinitePayment : 0)
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

  const series = seriesConfig
    .filter((it) => it.data.length > 0)
    .map((it) => ({
      type: it.type,
      name: it.name,
      color: it.color,
      pointWidth: it.pointWidth ?? 25,
      data: fillYAxis(xAxisSkeleton, it.data),
    }))

  const xAxis = Object.keys(xAxisSkeleton)
  return {
    xAxis,
    series,
  }
}
