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

// TODO PEK-163 tilpasse tester
export const getAntallMaanederMedPensjon = (
  isFirstYear: boolean,
  isLastYear: boolean,
  startMonth: number, // Heltall 0-11
  sluttMonth: number // Heltall 0-11
) => {
  if (!isFirstYear && !isLastYear) {
    return 12
  }

  if (isFirstYear && !isLastYear) {
    // Hvis det er første år er startMonth mest sannsynlig 1
    // Hvis det er ulik 1, sjekk at sluttMonth er lik startMonth slik at det blir 12 mnd
    if (startMonth === 0 || (startMonth > 0 && startMonth === sluttMonth)) {
      return 12
    } else {
      // TODO PEK-163 - Hvis ikke - hva gjør vi?
      return 12
    }
    // UTDATERT: Gjelder fra og med måneden etter fødseslsemåned (såkalt 0 måneden) til og med bursdagsmaaneden igjen
    // return 12 - startMonth
  }
  if (!isFirstYear && isLastYear) {
    // UTDATERT Gjelder fra og med måneden etter fødseslsmåned (såkalt 0 måneden) til og med sluttMaaneden
    // En avtale med utbetalingsperiode på (74,1) → (75,1) betyr 12 måneder med utbetaling
    // En avtale med utbetalingsperiode på (74,6) → (75,1) betyr 7 måneder med utbetaling
    return 12 - startMonth + sluttMonth
  }
  if (isFirstYear && isLastYear) {
    //  UTDATERT Gjelder fra og med måneden etter fødseslsmåned  (såkalt 0 måneden) til og med sluttmaaneden
    // En avtale med utbetalingsperiode på (74,1) → (74,6) betyr 5 måneder med utbetaling.
    return sluttMonth - startMonth
  }
  return 0
}

// TODO PEK-163 sjekke hvordan livsvarige pensjonsavtaler ser ut
// For livsvarige ytelser er sluttMaaned utelatt. For utbetalingsperioder med sluttalder er sluttmaaned påkrevd
export const processPensjonsavtalerArray = (
  startAar: number,
  length: number,
  pensjonsavtaler: Pensjonsavtale[]
): number[] => {
  const sluttAlder = startAar + length - 1
  const result = new Array(sluttAlder - startAar + 1).fill(0)

  // TODO PEK-163 håndtere at en avtale ikke alltid har startaar - hva gjør vi da?
  pensjonsavtaler.forEach((avtale) => {
    avtale.utbetalingsperioder.forEach((utbetalingsperiode) => {
      const avtaleStartYear = Math.max(
        startAar,
        utbetalingsperiode.startAlder.aar
      )
      const avtaleEndYear = utbetalingsperiode.sluttAlder
        ? Math.min(sluttAlder, utbetalingsperiode.sluttAlder.aar)
        : sluttAlder

      for (let year = avtaleStartYear; year <= avtaleEndYear; year++) {
        if (year >= startAar) {
          const isFirstYear = year === avtaleStartYear
          const isLastYear =
            utbetalingsperiode.sluttAlder && year === avtaleEndYear

          const antallMaanederMedPensjon = getAntallMaanederMedPensjon(
            isFirstYear,
            !!isLastYear,
            utbetalingsperiode.startAlder.maaneder,
            utbetalingsperiode.sluttAlder?.maaneder ?? 0
          )
          const allocatedAmount =
            (utbetalingsperiode.aarligUtbetaling *
              utbetalingsperiode.grad *
              Math.max(0, antallMaanederMedPensjon)) /
            100 /
            12

          result[year - startAar] += allocatedAmount
        }
      }
    })
  })
  return result
}

export const generateXAxis = (
  startAar: number,
  pensjonsavtaler: Pensjonsavtale[],
  setIsPensjonsavtaleFlagVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  let sluttAar = MAX_UTTAKSALDER
  let hasAvtaleBeforeStartAlder = false

  pensjonsavtaler.forEach((avtale) => {
    if (avtale.sluttAar && avtale.sluttAar > sluttAar) {
      sluttAar = avtale.sluttAar
    }
    if (
      !hasAvtaleBeforeStartAlder &&
      avtale.startAar &&
      avtale.startAar < startAar
    ) {
      hasAvtaleBeforeStartAlder = true
    }
  })
  const alderArray: string[] = []
  for (let i = startAar; i <= sluttAar + 1; i++) {
    if (i === startAar) {
      alderArray.push((i - 1).toString())
    }

    if (i === sluttAar + 1) {
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
