import { Chart, Point, Series } from 'highcharts'

import {
  COLUMN_WIDTH,
  MAX_UTTAKSALDER,
  SERIES_COLORS,
  highchartsScrollingSelector,
} from './constants'
import {
  ExtendedAxis,
  HighchartsScrollingHTMLDivElement,
} from './utils-highcharts'

export const getChartDefaults = (aarArray: string[]) => {
  return {
    chart: {
      type: 'column',
      scrollablePlotArea: {
        minWidth: aarArray.length * COLUMN_WIDTH * 1.6,
        scrollPositionX: 0,
      },
    },
    xAxis: {
      categories: aarArray,
    },
  }
}

export const processInntektArray = (
  beloep: number,
  length: number
): number[] => {
  const dataArray = new Array(length).fill(0)
  dataArray[0] = beloep
  return dataArray
}

export const processPensjonsberegningArray = (
  pensjonsberegninger: Pensjonsberegning[] = []
): number[] => {
  const dataArray = [...pensjonsberegninger].map((value) => {
    return value.beloep
  })
  dataArray.unshift(0)
  return dataArray
}

export const getAntallMaanederMedPensjon = (
  isFirstYear: boolean,
  isLastYear: boolean,
  startMonth: number, // Heltall 1-12 fra Norsk Pensjon
  sluttMonth: number // Heltall 1-12 fra Norsk Pensjon
) => {
  // I måten NAV beregner er start- og sluttMåned heltall fra 0-12. Tilpasser startMonth for enklere logikk
  const startMonthNav = startMonth - 1
  if (!isFirstYear && !isLastYear) {
    return 12
  }
  if (isFirstYear && !isLastYear) {
    // Gjelder fra og med måneden etter fødseslsemåned (såkalt 0 måneden) til og med bursdagsmaaneden igjen
    return 12 - startMonthNav
  }
  if (!isFirstYear && isLastYear) {
    // Gjelder fra og med måneden etter fødseslsmåned (såkalt 0 måneden) til og med sluttMaaneden
    return sluttMonth
  }
  if (isFirstYear && isLastYear) {
    //  Gjelder fra og med måneden etter fødseslsmåned  (såkalt 0 måneden) til og med sluttmaaneden
    return sluttMonth - startMonthNav
  }
  return 0
}

export const processPensjonsavtalerArray = (
  startAlder: number,
  length: number,
  pensjonsavtaler: Pensjonsavtale[]
): number[] => {
  const sluttAlder = startAlder + length - 1
  const result = new Array(sluttAlder - startAlder + 1).fill(0)

  pensjonsavtaler.forEach((avtale) => {
    avtale.utbetalingsperioder.forEach((utbetalingsperiode) => {
      const avtaleStartYear = Math.max(
        startAlder,
        utbetalingsperiode.startAlder
      )
      const avtaleEndYear = utbetalingsperiode.sluttAlder
        ? Math.min(sluttAlder, utbetalingsperiode.sluttAlder)
        : sluttAlder

      for (let year = avtaleStartYear; year <= avtaleEndYear; year++) {
        if (year >= startAlder) {
          const isFirstYear = year === avtaleStartYear
          const isLastYear =
            utbetalingsperiode.sluttAlder && year === avtaleEndYear

          const antallMaanederMedPensjon = getAntallMaanederMedPensjon(
            isFirstYear,
            !!isLastYear,
            utbetalingsperiode.startMaaned,
            utbetalingsperiode.sluttMaaned ?? 0
          )
          const allocatedAmount =
            (utbetalingsperiode.aarligUtbetaling *
              utbetalingsperiode.grad *
              Math.max(0, antallMaanederMedPensjon)) /
            100 /
            12

          result[year - startAlder] += allocatedAmount
        }
      }
    })
  })
  return result
}

export const generateXAxis = (
  startAlder: number,
  pensjonsavtaler: Pensjonsavtale[],
  setIsPensjonsavtaleFlagVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  let sluttAlder = MAX_UTTAKSALDER
  let hasAvtaleBeforeStartAlder = false

  pensjonsavtaler.forEach((avtale) => {
    if (avtale.sluttAlder && avtale.sluttAlder > sluttAlder) {
      sluttAlder = avtale.sluttAlder
    }
    if (
      !hasAvtaleBeforeStartAlder &&
      avtale.startAlder &&
      avtale.startAlder < startAlder
    ) {
      hasAvtaleBeforeStartAlder = true
    }
  })
  const alderArray: string[] = []
  for (let i = startAlder; i <= sluttAlder + 1; i++) {
    if (i === startAlder) {
      alderArray.push((i - 1).toString())
    }

    if (i === sluttAlder + 1) {
      alderArray.push(`${i - 1}+`.toString())
    } else {
      alderArray.push(i.toString())
    }
  }
  setIsPensjonsavtaleFlagVisible(hasAvtaleBeforeStartAlder)
  return alderArray
}

export function getTooltipTitle(
  hasInntekt: boolean,
  hasPensjon: boolean
): string {
  if (hasInntekt && hasPensjon) {
    return 'Inntekt og pensjon når du er'
  } else if (hasInntekt && !hasPensjon) {
    return 'Inntekt når du er'
  } else {
    return 'Pensjon når du er'
  }
}

export const onVisFaerreAarClick = () => {
  const el = document.querySelector(highchartsScrollingSelector)
  if (el) {
    ;(el as HTMLElement).scrollLeft -= 50
  }
}

export const onVisFlereAarClick = () => {
  const el = document.querySelector(highchartsScrollingSelector)
  if (el) {
    ;(el as HTMLElement).scrollLeft += 50
  }
}

export const getHoverColor = (previousColor: string): string => {
  switch (previousColor) {
    case SERIES_COLORS.SERIE_COLOR_INNTEKT: {
      return SERIES_COLORS.SERIE_COLOR_FADED_INNTEKT
    }
    case SERIES_COLORS.SERIE_COLOR_AFP: {
      return SERIES_COLORS.SERIE_COLOR_FADED_AFP
    }
    case SERIES_COLORS.SERIE_COLOR_TP: {
      return SERIES_COLORS.SERIE_COLOR_FADED_TP
    }
    case SERIES_COLORS.SERIE_COLOR_ALDERSPENSJON: {
      return SERIES_COLORS.SERIE_COLOR_FADED_ALDERSPENSJON
    }
    default: {
      return ''
    }
  }
}

export const getNormalColor = (previousColor: string): string => {
  switch (previousColor) {
    case SERIES_COLORS.SERIE_COLOR_FADED_INNTEKT: {
      return SERIES_COLORS.SERIE_COLOR_INNTEKT
    }
    case SERIES_COLORS.SERIE_COLOR_FADED_AFP: {
      return SERIES_COLORS.SERIE_COLOR_AFP
    }
    case SERIES_COLORS.SERIE_COLOR_FADED_TP: {
      return SERIES_COLORS.SERIE_COLOR_TP
    }
    case SERIES_COLORS.SERIE_COLOR_FADED_ALDERSPENSJON: {
      return SERIES_COLORS.SERIE_COLOR_ALDERSPENSJON
    }
    default: {
      return previousColor
    }
  }
}

export function resetColumnColors(chart: Chart): void {
  chart.series.forEach(function (serie: Series) {
    serie.data.forEach(function (point: Point) {
      const color = getNormalColor(point.color as string)
      if (point.color !== color) {
        point.update({ color: getNormalColor(point.color as string) }, false)
      }
    })
  })

  if ((chart.xAxis[0] as ExtendedAxis).labelGroup) {
    ;(chart.xAxis[0] as ExtendedAxis).labelGroup.element.childNodes.forEach(
      function (label: HTMLElement) {
        label.style.fontWeight = 'normal'
      }
    )
  }
  chart?.tooltip.update({
    enabled: false,
  })
  chart.redraw()
}

export function handleChartScroll(
  event: Event,
  args: {
    chart?: Chart
    scrollPosition?: number
  }
) {
  if (event.currentTarget) {
    const { chart, scrollPosition } = args
    const el = event.currentTarget as HighchartsScrollingHTMLDivElement
    const elementScrollPosition = el.scrollLeft
    if (chart && scrollPosition !== el.scrollLeft) {
      resetColumnColors(chart)
    }

    const isRightButtonAvailable = el.scrollWidth > el.offsetWidth

    if (elementScrollPosition === 0) {
      el.handleButtonVisibility.showRightButton(isRightButtonAvailable)
      el.handleButtonVisibility.showLeftButton(false)
    } else if (elementScrollPosition + el.offsetWidth === el.scrollWidth) {
      el.handleButtonVisibility.showRightButton(false)
      el.handleButtonVisibility.showLeftButton(true)
    } else {
      el.handleButtonVisibility.showRightButton(isRightButtonAvailable)
      el.handleButtonVisibility.showLeftButton(true)
    }
  }
}
