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

export const processPensjonsberegningArray = (
  pensjonsberegninger: Pensjonsberegning[] = []
): number[] => {
  const dataArray = [...pensjonsberegninger].map((value) => {
    return value.beloep
  })
  dataArray.unshift(0)
  return dataArray
}

export const processPensjonsavtalerArray = (
  startAlder: number,
  length: number,
  foedsesldato: string,
  pensjonsavtaler: Pensjonsavtale[]
): number[] => {
  const d = new Date(foedsesldato)
  const foedselsmaaned = d.getMonth() + 1

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

          // TODO hva skjer dersom brukeren har en avtale som bikker over neste år.
          // Eks: hva skjer med en bruker som er født 01.12 med en avtale som starter på 66 år blank? (skulle da teoretisk være om én måned etter fødsesldato)
          // Tar backend høyde for det ved å aldri returnere mer enn noe som bikker over, og forsåvidt aldri mer enn 11 på "sluttAlder"?
          const startMonth = isFirstYear
            ? foedselsmaaned + utbetalingsperiode.startMaaned + 1
            : 1

          // TODO Hvordan beregner man sluttMåned? Er det som startMaaned som trenger å legges +1 på?
          const endMonth =
            isLastYear && utbetalingsperiode.sluttMaaned !== undefined
              ? foedselsmaaned + utbetalingsperiode.sluttMaaned
              : isLastYear && utbetalingsperiode.sluttMaaned === undefined
              ? foedselsmaaned
              : 12

          const monthsInYear =
            endMonth <= 0 || endMonth > 12 ? 0 : endMonth - startMonth + 1
          const allocatedAmount =
            (utbetalingsperiode.aarligUtbetaling *
              utbetalingsperiode.grad *
              Math.max(0, monthsInYear)) /
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
